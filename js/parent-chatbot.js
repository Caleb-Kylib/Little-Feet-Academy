/**
 * Little Feet Academy — Parent inquiry assistant (floating widget)
 *
 * Default: smart FAQ + keyword replies (no API keys, works offline).
 * Optional real AI: before this script loads, set:
 *   window.LFA_CHATBOT = {
 *     openaiKey: "sk-...",           // never commit real keys to git
 *     model: "gpt-4o-mini"           // optional
 *   };
 * For production, prefer a tiny server / edge proxy instead of exposing keys in the browser.
 */
(function () {
  "use strict";

  var WIDGET_ID = "lfa-parent-chatbot";

  if (document.getElementById(WIDGET_ID)) return;

  var cfg = window.LFA_CHATBOT || {};

  var SYSTEM_CONTEXT =
    "You are a warm, concise assistant for Little Feet Academy in Ongata Rongai, Kenya. " +
    "You help parents with admissions, visits, programs (CBC), fees (direct to office), hours, and contact. " +
    "If unsure, suggest contacting hello@littlefeetacademy.co.ke or +254 796 609 626 or WhatsApp. " +
    "Keep answers short (under 120 words), friendly, and accurate.";

  var FAQ_RULES = [
    {
      keys: ["hour", "open", "close", "time", "when"],
      reply:
        "We are typically open **Monday–Friday, 8:00 AM–5:00 PM** (check the top bar on the site for the latest). " +
        "If you need a tour outside those hours, tell us your preferred time on the contact page and we will try to help.",
    },
    {
      keys: ["fee", "fees", "cost", "price", "tuition", "pay"],
      reply:
        "Fee details can change by grade and term. The fastest way is to ask our office: **hello@littlefeetacademy.co.ke** or **+254 796 609 626**, or use the **Admissions** page to start an enquiry.",
    },
    {
      keys: ["admission", "enrol", "enroll", "apply", "join", "register"],
      reply:
        "Great question. Start on our **Admissions** page for steps and forms, or WhatsApp us for a quick reply. We can also schedule a **school visit** if you would like to see classrooms first.",
    },
    {
      keys: ["visit", "tour", "see the school", "book"],
      reply:
        "We love hosting families. Use **Book a Visit** (top navigation) or the **Contact** page to request a tour. If you tell us your child’s age, we can suggest the best program to see.",
    },
    {
      keys: ["cbc", "curriculum", "competency", "8-4-4"],
      reply:
        "We follow Kenya’s **Competency-Based Curriculum (CBC)** with a focus on practical learning and whole-child growth. Browse **Programs** for pathways, or read the **CBC articles** on our News page.",
    },
    {
      keys: ["age", "grade", "class", "playgroup", "pp1", "pp2", "primary", "junior"],
      reply:
        "Program fit depends on your child’s age and readiness. The clearest overview is on **Programs** and each program page (Playgroup, Pre-primary, Lower Primary, Junior Secondary). Tell us your child’s age and we can point you to the best match.",
    },
    {
      keys: ["location", "where", "address", "map", "rongai"],
      reply:
        "We are in **Ongata Rongai, Kenya**. You can open the map link from the footer or message us on WhatsApp and we will share directions.",
    },
    {
      keys: ["whatsapp", "chat", "wa"],
      reply:
        "You can WhatsApp us anytime from the green button on the site, or tap **Chat on WhatsApp** in this panel.",
    },
  ];

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function normalize(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  function ruleBasedAnswer(userText) {
    var q = normalize(userText);
    if (!q) return null;
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < FAQ_RULES.length; i++) {
      var rule = FAQ_RULES[i];
      var score = 0;
      for (var k = 0; k < rule.keys.length; k++) {
        if (q.indexOf(rule.keys[k]) !== -1) score += 2;
      }
      if (score > bestScore) {
        bestScore = score;
        best = rule.reply;
      }
    }
    if (bestScore >= 2) return best;
    if (q.length < 3) return null;
    return (
      "Thanks for reaching out. I can help with **admissions**, **visits**, **programs/CBC**, **hours**, and **location**. " +
      "Try asking in one short sentence, or use the quick buttons below. " +
      "For anything specific to your child, our office replies fastest on **WhatsApp** or **hello@littlefeetacademy.co.ke**."
    );
  }

  function markdownLite(s) {
    return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function appendMessage(role, text) {
    var body = root.querySelector(".lfa-chatbot__messages");
    if (!body) return;
    var row = el("div", "lfa-chatbot__msg lfa-chatbot__msg--" + role);
    var bubble = el("div", "lfa-chatbot__bubble");
    bubble.innerHTML = markdownLite(text);
    row.appendChild(bubble);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function setTyping(on) {
    var t = root.querySelector(".lfa-chatbot__typing");
    if (t) t.hidden = !on;
    var body = root.querySelector(".lfa-chatbot__messages");
    if (body) body.scrollTop = body.scrollHeight;
  }

  function openaiAnswer(userText, cb) {
    if (!cfg.openaiKey) {
      cb(null);
      return;
    }
    var model = cfg.model || "gpt-4o-mini";
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + cfg.openaiKey,
      },
      body: JSON.stringify({
        model: model,
        temperature: 0.4,
        max_tokens: 280,
        messages: [
          { role: "system", content: SYSTEM_CONTEXT },
          { role: "user", content: userText },
        ],
      }),
    })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok) throw new Error((j && j.error && j.error.message) || "API error");
          var txt = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
          cb(txt || null);
        });
      })
      .catch(function () {
        cb(null);
      });
  }

  function handleUserMessage(text) {
    var trimmed = (text || "").trim();
    if (!trimmed) return;
    appendMessage("user", trimmed);
    input.value = "";
    setTyping(true);

    function finish(reply) {
      setTyping(false);
      appendMessage("bot", reply);
    }

    openaiAnswer(trimmed, function (ai) {
      if (ai) {
        finish(ai.trim());
        return;
      }
      var local = ruleBasedAnswer(trimmed);
      finish(local || ruleBasedAnswer("help"));
    });
  }

  var root = el("aside", "lfa-chatbot");
  root.id = WIDGET_ID;
  root.setAttribute("aria-label", "Parent inquiry assistant");

  root.innerHTML =
    '<button type="button" class="lfa-chatbot__fab" aria-expanded="false" aria-controls="lfa-chatbot-panel" title="Ask Little Feet">' +
    '<span class="lfa-chatbot__fab-icon" aria-hidden="true"><i class="fas fa-comments"></i></span>' +
    '<span class="lfa-chatbot__fab-pulse" aria-hidden="true"></span>' +
    "</button>" +
    '<div class="lfa-chatbot__panel shadow-lg" id="lfa-chatbot-panel" hidden>' +
    '<div class="lfa-chatbot__head">' +
    '<div>' +
    '<div class="lfa-chatbot__title">Family Assistant</div>' +
    '<div class="lfa-chatbot__subtitle">Quick answers for parents</div>' +
    "</div>" +
    '<button type="button" class="lfa-chatbot__close btn btn-sm btn-light rounded-circle" aria-label="Close chat">&times;</button>' +
    "</div>" +
    '<div class="lfa-chatbot__messages" role="log" aria-live="polite"></div>' +
    '<div class="lfa-chatbot__typing" hidden><span></span><span></span><span></span></div>' +
    '<div class="lfa-chatbot__quick d-flex flex-wrap gap-2">' +
    '<button type="button" class="btn btn-sm btn-outline-secondary rounded-pill" data-q="What are your school hours?">Hours</button>' +
    '<button type="button" class="btn btn-sm btn-outline-secondary rounded-pill" data-q="How do I apply for admissions?">Admissions</button>' +
    '<button type="button" class="btn btn-sm btn-outline-secondary rounded-pill" data-q="Can we book a school visit?">Visit</button>' +
    '<button type="button" class="btn btn-sm btn-outline-secondary rounded-pill" data-q="Tell me about CBC at Little Feet">CBC</button>' +
    "</div>" +
    '<form class="lfa-chatbot__form mt-2">' +
    '<label class="visually-hidden" for="lfa-chatbot-input">Your question</label>' +
    '<div class="input-group">' +
    '<input id="lfa-chatbot-input" type="text" class="form-control" placeholder="Ask anything…" autocomplete="off" maxlength="500" />' +
    '<button class="btn btn-primary" type="submit" aria-label="Send"><i class="fas fa-paper-plane"></i></button>' +
    "</div>" +
    "</form>" +
    '<div class="lfa-chatbot__links mt-2 small">' +
    '<a href="admissions.html">Admissions</a> · <a href="contact.html">Contact</a> · <a href="news.html#learning-articles">CBC articles</a> · ' +
    '<a href="https://wa.me/254796609626" target="_blank" rel="noopener noreferrer">WhatsApp</a>' +
    "</div>" +
    "</div>";

  document.body.appendChild(root);

  var panel = root.querySelector(".lfa-chatbot__panel");
  var fab = root.querySelector(".lfa-chatbot__fab");
  var form = root.querySelector(".lfa-chatbot__form");
  var input = root.querySelector("#lfa-chatbot-input");
  var closeBtn = root.querySelector(".lfa-chatbot__close");

  appendMessage(
    "bot",
    "Hi there. I am here to help with **admissions**, **school visits**, **programs**, and **general questions**. " +
      "Ask in your own words, or tap a quick topic below."
  );

  function setOpen(open) {
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      setTimeout(function () {
        input.focus();
      }, 120);
    }
  }

  fab.addEventListener("click", function () {
    setOpen(panel.hidden);
  });
  closeBtn.addEventListener("click", function () {
    setOpen(false);
  });

  root.querySelectorAll(".lfa-chatbot__quick button[data-q]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var q = btn.getAttribute("data-q");
      handleUserMessage(q);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    handleUserMessage(input.value);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
})();

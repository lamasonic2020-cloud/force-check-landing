/* Force Check — form handling.

   Posts straight to a Google Form's response endpoint, so the page keeps its
   own design while Google Forms does the collecting. Google does not send CORS
   headers on that endpoint, so the request goes out opaque (`no-cors`): the
   submission lands, but the browser is not allowed to read the reply. That
   means we cannot tell a Google-side rejection from a success — everything
   that leaves the page is treated as sent. Validation therefore happens here,
   before anything is submitted. */
(function () {
  "use strict";

  var CFG = window.FORCE_CHECK_FORM || {};
  var FIELDS = CFG.fields || {};
  var ENTRY = /^entry\.\d+$/;

  var CONFIGURED =
    /^[\w-]{20,}$/.test(String(CFG.formId || "")) &&
    ENTRY.test(String(FIELDS.first_name || "")) &&
    ENTRY.test(String(FIELDS.email || ""));

  var ASK_EXPERIENCE = ENTRY.test(String(FIELDS.experience || ""));
  var ACTION = "https://docs.google.com/forms/d/e/" + CFG.formId + "/formResponse";
  var STORE = "forceCheckLead";

  /* ---------- helpers ---------- */

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  }

  function remember(lead) {
    try { sessionStorage.setItem(STORE, JSON.stringify(lead)); } catch (e) {}
  }

  function recall() {
    try { return JSON.parse(sessionStorage.getItem(STORE) || "null"); }
    catch (e) { return null; }
  }

  function params(values) {
    var body = new URLSearchParams();
    Object.keys(values).forEach(function (key) {
      if (ENTRY.test(String(FIELDS[key] || "")) && values[key]) {
        body.append(FIELDS[key], values[key]);
      }
    });
    body.append("fvv", "1");
    body.append("pageHistory", "0");
    return body;
  }

  /* Last-resort path for browsers that refuse the opaque fetch: post a real
     form into a hidden iframe, which no CORS rule applies to. */
  function iframePost(body) {
    return new Promise(function (resolve) {
      var id = "fc-sink-" + Date.now();
      var sink = document.createElement("iframe");
      sink.name = id;
      sink.style.display = "none";
      document.body.appendChild(sink);

      var form = document.createElement("form");
      form.action = ACTION;
      form.method = "POST";
      form.target = id;
      form.style.display = "none";

      body.forEach(function (value, name) {
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      setTimeout(function () {
        form.remove();
        sink.remove();
        resolve();
      }, 1200);
    });
  }

  function send(values) {
    var body = params(values);
    var attempt = fetch(ACTION, { method: "POST", mode: "no-cors", body: body })
      .catch(function () { return iframePost(body); });

    // Never leave someone staring at a spinner because Google is slow.
    return Promise.race([
      attempt,
      new Promise(function (resolve) { setTimeout(resolve, 8000); })
    ]);
  }

  /* ---------- signup forms ---------- */

  function wireForm(form) {
    var name = form.querySelector('input[name="first_name"]');
    var email = form.querySelector('input[name="email"]');
    var hp = form.querySelector('input[name="company"]');
    var btn = form.querySelector('button[type="submit"]');
    var msg = form.querySelector(".msg");
    var label = btn.textContent;

    function fail(text, field) {
      msg.className = "msg err";
      msg.textContent = text;
      if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
      btn.disabled = false;
      btn.textContent = label;
    }

    [name, email].forEach(function (f) {
      f.addEventListener("input", function () { f.removeAttribute("aria-invalid"); });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      msg.textContent = "";
      msg.className = "msg";

      if (!name.value.trim()) return fail("Please add your first name.", name);
      if (!validEmail(email.value)) return fail("That email address doesn't look right.", email);
      if (hp && hp.value) return;                       // bot filled the honeypot

      if (!CONFIGURED) {
        return fail("This form isn't connected yet — see SETUP.md (config.js).");
      }

      btn.disabled = true;
      btn.textContent = "Sending…";

      var lead = { first_name: name.value.trim(), email: email.value.trim().toLowerCase() };

      send(lead).then(function () {
        remember(lead);
        location.href = "thank-you.html";
      });
    });
  }

  document.querySelectorAll("form[data-force-check]").forEach(wireForm);

  /* ---------- thank-you page: experience question ---------- */

  var choices = document.querySelector("[data-segment]");
  if (choices) {
    var lead = recall();
    var block = choices.closest("[data-segment-block]") || choices;

    var greet = document.querySelector("[data-greeting]");
    if (greet && lead && lead.first_name) {
      greet.textContent = lead.first_name + ", your Force Check is on its way.";
    }

    // Hidden unless someone actually signed up AND a field exists to answer into.
    if (!lead || !lead.email || !ASK_EXPERIENCE) {
      block.hidden = true;
    } else {
      choices.querySelectorAll(".choice").forEach(function (b) {
        b.addEventListener("click", function () {
          if (choices.dataset.done === "1") return;
          choices.dataset.done = "1";
          b.setAttribute("aria-pressed", "true");

          var out = block.querySelector(".msg");
          if (out) { out.className = "msg ok"; out.textContent = "Got it — thanks. That's all I needed."; }

          send({
            first_name: lead.first_name,
            email: lead.email,
            experience: b.dataset.value
          });
        });
      });
    }
  }
})();

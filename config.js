/* ─────────────────────────────────────────────────────────────
   唯一需要你手動修改的檔案。

   這個落地頁把名字和 Email 送進一份 Google 表單（Google Forms），
   所以名單會直接進到那份表單的「回覆」分頁和它連動的試算表。

   下面三個值都從你自己的 Google 表單抄過來，做法看 SETUP.md 第一節。
   ───────────────────────────────────────────────────────────── */

window.FORCE_CHECK_FORM = {

  // 表單的公開網址 https://docs.google.com/forms/d/e/●●●●●/viewform
  // 中間 ●●●●● 那一長串就是 formId（注意是 /d/e/ 後面那串，不是編輯網址的）
  formId: "1FAIpQLSfSEmR-G_sWnD_JbQYz6RujHyS37WqrQA1V1LLJN11jU63a2w",

  fields: {
    // 用「取得預先填入的連結」拿到的 entry 編號
    first_name: "entry.480637210",
    email:      "entry.1987916465",

    // 選填。留空字串 = 感謝頁不會問「執業幾年」這一題。
    // 想開這題的話，在表單多加一個簡答題，把它的 entry 編號填進來。
    experience: ""
  }
};

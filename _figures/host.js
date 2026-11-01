/*
 * The site's host for one Hairline figure: the part the Hairline bench does on
 * its test page, cut down to what the home page needs. It finds the stage, hands
 * the figure an svg and a read-out, and on touch screens (no hover) lets the
 * figure walk its own tour until a finger arrives. Colours come from the
 * --hairline-* variables set on the stage in css/site.css.
 */
(() => {
  let mounted = false;
  window.hairline = (figure) => {
    if (mounted) return;
    const stage = document.querySelector("[data-figure='" + figure.name + "']");
    if (!stage) return;
    mounted = true;
    HL.inject(document);
    stage.setAttribute("data-hairline", figure.name);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", figure.means);
    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    const read = { textContent: "" };
    figure.mount({ stage, svg, read }, figure.range[1]);
    if (matchMedia("(hover: none)").matches) HL.tour(stage, figure.tour || HL.LAP, () => {});
  };
})();

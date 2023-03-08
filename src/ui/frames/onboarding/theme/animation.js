const keyframes = {
  collapse: {
    "0%": {
      opacity: 1,
      overflow: "hidden",
      height: "var(--radix-collapsible-content-height)",
    },
    "100%": { opacity: 0, overflow: "hidden", height: 0 },
  },
  expand: {
    "0%": { opacity: 0, overflow: "hidden", height: 0 },
    "100%": {
      opacity: 1,
      overflow: "hidden",
      height: "var(--radix-collapsible-content-height)",
    },
  },

  fadeIn: {
    "0%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
  fadeOut: {
    "0%": { opacity: 1 },
    "100%": { opacity: 0 },
  },

  slideInLeft: {
    "0%": { transform: "translate3d(-100%, 0, 0)" },
    "100%": { transform: "translate3d(0, 0, 0)" },
  },
  slideOutLeft: {
    "0%": { transform: "translate3d(0, 0, 0)" },
    "100%": { transform: "translate3d(-100%, 0, 0)" },
  },
  slideInRight: {
    "0%": { transform: "translate3d(100%, 0, 0)" },
    "100%": { transform: "translate3d(0, 0, 0)" },
  },
  slideOutRight: {
    "0%": { transform: "translate3d(0, 0, 0)" },
    "100%": { transform: "translate3d(100%, 0, 0)" },
  },

  slideUpAndFade: {
    "0%": {
      opacity: 0,
      transform: "translate3d(0, 8px, 0)",
    },
    "100%": {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  },
  slideRightAndFade: {
    "0%": {
      opacity: 0,
      transform: "translate3d(-8px, 0, 0)",
    },
    "100%": {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  },
  slideDownAndFade: {
    "0%": {
      opacity: 0,
      transform: "translate3d(0, -8px, 0)",
    },
    "100%": {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  },
  slideLeftAndFade: {
    "0%": {
      opacity: 0,
      transform: "translate3d(8px, 0, 0)",
    },
    "100%": {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  },

  zoomIn: {
    "0%": {
      opacity: 0,
      transform: "scale3d(0.95, 0.95, 0.95)",
    },
    "100%": {
      opacity: 1,
      transform: "scale3d(1, 1, 1)",
    },
  },
  zoomOut: {
    "0%": {
      opacity: 1,
      transform: "scale3d(1, 1, 1)",
    },
    "100%": {
      opacity: 0,
      transform: "scale3d(0.95, 0.95, 0.95)",
    },
  },
};

const animation = {
  collapse: "collapse 200ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
  expand: "expand 200ms cubic-bezier(0.87, 0, 0.13, 1) forwards",

  "fade-in": "fadeIn 300ms ease-out forwards",
  "fade-out": "fadeOut 200ms ease-in-out forwards",

  "slide-in-left": "slideInLeft 300ms ease-out forwards",
  "slide-out-left": "slideOutLeft 200ms ease-in-out forwards",
  "slide-in-right": "slideInRight 300ms ease-out forwards",
  "slide-out-right": "slideOutRight 200ms ease-in-out forwards",

  "slide-up-and-fade": "slideUpAndFade 300ms ease-out forwards",
  "slide-right-and-fade": "slideRightAndFade 300ms ease-out forwards",
  "slide-down-and-fade": "slideDownAndFade 300ms ease-out forwards",
  "slide-left-and-fade": "slideLeftAndFade 300ms ease-out forwards",

  "zoom-in": "zoomIn 300ms ease-out forwards",
  "zoom-out": "zoomOut 200ms ease-in-out forwards",
};

module.exports = { animation, keyframes };

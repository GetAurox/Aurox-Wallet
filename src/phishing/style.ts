export default function getStyles(id: string) {
  return {
    [`${id}-overlay`]: {
      "z-index": 99999,
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: "100%",
      height: "100%",
      "min-width": "100%",
      "min-height": "100%",
      margin: 0,
      padding: 0,
      color: "#fff",
      background: "#171c29",
    },
    [`${id}-top`]: {
      margin: 0,
      padding: "24px",
      background: "#f24840",
    },
    [`${id}-logo`]: {
      width: "58px",
      height: "35px",
      margin: 0,
      padding: 0,
      "background-image":
        "url(\"data:image/svg+xml,%3Csvg width='66' height='40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M65.488.76c-.31-.41-.822-.513-1.248-.258l-6.226 3.742a8.83 8.83 0 0 1-4.537 1.277H47.92c-1.73 0-3.42.35-5.03 1.042l-2.82 1.21-3.741-.643-.23-.04c-1-.173-2.032-.352-3.1-.352-1.066 0-2.099.18-3.1.351l-3.972.681-2.82-1.21a12.675 12.675 0 0 0-5.03-1.043h-5.555c-1.581 0-3.15-.44-4.537-1.276L1.757.5C1.333.248.822.355.51.76a1.153 1.153 0 0 0 .06 1.476l6.388 7.003c.913 1 2.121 1.661 3.402 1.854l5.641.86c.775.117 1.51.46 2.121.99l.694.6c-.653.343-1.149.966-1.375 1.723a3.165 3.165 0 0 0 .242 2.397L28.79 38.15c.266.496.715.857 1.223.995l.719.192a8.76 8.76 0 0 0 4.544 0l.718-.193a2.015 2.015 0 0 0 1.224-.994l11.105-20.487c.392-.722.48-1.6.241-2.398-.226-.756-.722-1.379-1.374-1.723l.693-.598a4.218 4.218 0 0 1 2.121-.991l5.642-.86c1.28-.196 2.488-.853 3.401-1.854l6.389-7.003A1.16 1.16 0 0 0 65.488.76ZM29.852 8.413l.233-.04c.953-.166 1.942-.338 2.915-.338.972 0 1.96.172 2.915.337l1.967.337-4.415 1.896c-.301.13-.637.13-.938 0l-4.415-1.896 1.738-.296Zm-13.69 2.257-5.641-.86c-1.027-.155-1.993-.685-2.727-1.486L4.935 5.19l3.26 2.632a4.871 4.871 0 0 0 2.683 1.083l6.637.527a5.245 5.245 0 0 1 2.5.877l1.337.894c.201.134.31.365.292.623a.662.662 0 0 1-.37.57l-1.227.575-1.196-1.035a5.255 5.255 0 0 0-2.689-1.266Zm13.643 26.823L18.701 17.006a1.767 1.767 0 0 1-.135-1.331 1.57 1.57 0 0 1 .825-.987l.48-.224.948.822 5.39 4.665c.383.33.653.797.76 1.317l3.122 16.535a.862.862 0 0 1-.286-.31Zm1.566.678L28.13 21c0-.004 0-.007-.003-.01a3.705 3.705 0 0 0-1.183-2.058l-5.833-5.05.63-.295c.622-.293 1.039-.932 1.09-1.672.046-.74-.28-1.438-.86-1.826l-1.337-.895a6.395 6.395 0 0 0-3.032-1.063l-6.636-.526a3.757 3.757 0 0 1-2.068-.836l-2.39-1.93.903.544a9.92 9.92 0 0 0 5.108 1.434h5.557c1.579 0 3.126.32 4.597.95l9.426 4.052c.58.25 1.22.25 1.804 0l6.442-2.766 2.978-1.28a11.633 11.633 0 0 1 4.597-.952h5.557c1.779 0 3.546-.496 5.108-1.435l.904-.543-2.391 1.93a3.747 3.747 0 0 1-2.068.836l-6.636.526a6.396 6.396 0 0 0-3.032 1.063l-1.336.894c-.578.385-.907 1.084-.86 1.827.047.74.465 1.379 1.089 1.671l.63.296-5.83 5.043a3.705 3.705 0 0 0-1.182 2.057c0 .003 0 .007-.003.01l-3.242 17.172a7.593 7.593 0 0 1-3.257.003ZM47.3 17.006 36.194 37.493a.824.824 0 0 1-.286.306l3.123-16.534c.11-.52.38-.988.759-1.318l6.338-5.486.48.223c.393.183.694.544.826.987.131.448.081.933-.135 1.335Zm10.903-8.682c-.73.801-1.7 1.331-2.726 1.486l-5.642.86a5.362 5.362 0 0 0-2.692 1.259l-1.196 1.035-1.227-.574a.654.654 0 0 1-.37-.571.684.684 0 0 1 .292-.623l1.337-.894a5.268 5.268 0 0 1 2.5-.877l6.637-.527a4.862 4.862 0 0 0 2.683-1.083l3.26-2.632-2.856 3.141Z' fill='%23fff'/%3E%3C/svg%3E\")",
      "background-size": "100%",
    },
    [`${id}-container`]: {
      display: "flex",
      "justify-content": "center",
      margin: 0,
      padding: "104px 24px 24px",
    },
    [`${id}-inner`]: {
      display: "flex",
      "align-items": "flex-start",
      "justify-content": "center",
      margin: 0,
      padding: 0,
    },
    [`${id}-warn`]: {
      "flex-shrink": 0,
      "flex-grow": 0,
      width: "48px",
      height: "48px",
      margin: 0,
      padding: 0,
      "background-image":
        "url(\"data:image/svg+xml,%3Csvg width='56' height='56' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.987 5.25c2.672-4.667 9.354-4.667 12.026 0L55.06 42c2.673 4.667-.668 10.5-6.013 10.5H6.954C1.609 52.5-1.732 46.667.94 42L21.987 5.25Z' fill='%23F24840'/%3E%3Ccircle cx='28' cy='40.25' r='3.5' fill='%23fff'/%3E%3Crect x='25.375' y='12.25' width='5.25' height='21' rx='2.625' fill='%23fff'/%3E%3C/svg%3E\")",
      "background-size": "100%",
    },
    [`${id}-content`]: {
      "flex-shrink": 1,
      "flex-grow": 0,
      margin: "0 0 0 16px",
      padding: 0,
    },
    [`${id}-title`]: {
      margin: "4px 0 32px",
      padding: 0,
      color: "#f24840",
      "font-family": "Roboto,Arial,Helvetica,sans-serif",
      "font-weight": 700,
      "font-size": "28px",
      "line-height": "32px",
      "letter-spacing": "0.18px",
    },
    [`${id}-text`]: {
      margin: "0 0 56px",
      padding: 0,
      color: "#fff",
      "font-family": "Roboto,Arial,Helvetica,sans-serif",
      "font-weight": 400,
      "font-size": "14px",
      "line-height": "20px",
      "letter-spacing": "0.15px",
    },
    [`${id}-button`]: {
      margin: 0,
      padding: "9px 25px",
      border: "1px solid #2c81fc",
      color: "#fff",
      "font-family": "Roboto,Arial,Helvetica,sans-serif",
      "font-weight": 400,
      "font-size": "14px",
      "line-height": "20px",
      "letter-spacing": "0.15px",
      cursor: "pointer",
      "border-radius": "8px",
    },
    [`${id}-backButton`]: {
      color: "#fff",
      background: "#2c81fc",
    },
    [`${id}-backButton:hover`]: {
      background: "#418dfc",
    },
    [`${id}-continueButton`]: {
      "margin-left": "12px",
      color: "#2c81fc",
      background: "transparent",
    },
    [`${id}-continueButton:hover`]: {
      "border-color": "#418dfc",
      color: "#418dfc",
    },
    "@media(min-width:960px)": {
      [`${id}-top`]: {
        padding: "32px",
      },
      [`${id}-logo`]: {
        width: "66px",
        height: "40px",
      },
      [`${id}-container`]: {
        padding: "128px 32px 32px",
      },
      [`${id}-warn`]: {
        width: "56px",
        height: "56px",
      },
      [`${id}-content`]: {
        "max-width": "70%",
        margin: "0 0 0 24px",
      },
      [`${id}-title`]: {
        margin: "4px 0 40px",
        "font-size": "40px",
        "line-height": "47px",
      },
      [`${id}-text`]: {
        margin: "0 0 64px",
        "font-size": "16px",
        "line-height": "24px",
      },
      [`${id}-button`]: {
        "font-size": "16px",
        "line-height": "24px",
        "border-radius": "10px",
      },
      [`${id}-continueButton`]: {
        "margin-left": "16px",
      },
    },
  };
}

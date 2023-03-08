export let sender: "content-script" | "inject-script" | null = null;
export let id: string | null = null;

export function setMessageSender(_sender: "content-script" | "inject-script", _id: string | null) {
  sender = _sender;
  id = _id;
}

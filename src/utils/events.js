export const dispatchEvent = (name, data) => {
  const event = new CustomEvent(name, {
    detail: data,
  });
  document.dispatchEvent(event);
}
import { toast } from "react-hot-toast";

export default class Toast {
  static success(message, options) {
    toast.success(message, {
      style: {
        padding: '16px',
        color: '#fff',
        background: '#03920d',
        minWidth: 350
      },
      iconTheme: {
        primary: '#37d843',
        secondary: '#fff',
      },
      ...options
    });
  }

  static error(message, options) {
    toast.error(message, {
      style: {
        padding: '16px',
        color: '#fff',
        background: '#D93654',
        minWidth: 350
      },
      iconTheme: {
        primary: '#ff7777',
        secondary: '#fff',
      },
      ...options
    },);
  }

  static info(message, options) {
    toast.success(message, {
      style: {
        padding: '16px',
        color: '#fff',
        background: '#2196f4',
        minWidth: 350
      },
      iconTheme: {
        primary: '#303a9f',
        secondary: '#fff',
      },
      ...options
    },);
  }
}
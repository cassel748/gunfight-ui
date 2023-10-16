import { upperFirst } from 'lodash';
import StringMask from 'string-mask';

export const removeMask = str => {
  if (!str || !str.replace) {
    return;
  }  
  str = str.replace(/[ÀÁÂÃÄÅ]/g,"A");
  str = str.replace(/[àáâãäå]/g,"a");
  str = str.replace(/[ÈÉÊË]/g,"E");
  return str.replace(/[^a-z0-9]/gi,'');
}

export const formatPhone = value => {
  const formatter = new StringMask('(00) 0 0000-0000');
  return formatter.apply(value);
}

export const formatCpf = value => {
  const formatter = new StringMask('000.000.000-00');
  return formatter.apply(value);
}

export const formatCep = value => {
  const formatter = new StringMask('00000-000');
  return formatter.apply(value);
}

export const formatCurrency = value => {
  if (value === null || value === undefined) {
    return "";
  }

  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });

  return formatter.format(value);
}

export const toCurrency = value => {
  if (!value) {
    return;
  }
  
  if (!isNaN(value)) {
    value = value + "";
  }

  return (Number(value.replace(/\D/g, '')) / 100).toFixed(2);
}

export const capitalize = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  let words = value.trim().split(" ");
  return words
    .map(word => {
      return word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '';
    })
    .join(" ");
}

String.prototype.replaceAll = function(search, replacement) {
  const target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

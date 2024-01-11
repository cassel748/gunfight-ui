export const DOCUMENTS = [
  { title: "Documento de identificação", value: 1 },
  { title: "Carteira funcional", value: 2 },
  { title: "CR", value: 3 },
  { title: "CRAF - EB", value: 4 },
  { title: "CRAF - PF", value: 5 },
  { title: "Guia de Tráfego - EB", value: 6 },
  { title: "Guia de Tráfego - PF", value: 7 },
  { title: "Termo de Associação", value: 8 },
  { title: "Comprovante de Residência", value: 9 },
  { title: "Atestado Ocupação Lícita", value: 10 },
  { title: "Teste Tiro - EB", value: 11 },
  { title: "Teste Tiro - PF", value: 12 },
  { title: "Exame Psicológico", value: 13 },
  { title: "Procuração Pública", value: 14 },
];

export const NATIONALITY = [
  { title: "Brasileira", value: 1 },
  { title: "Estrangeira", value: 2 },
];

export const NATIONALITY_UNGENDERED = [
  { title: "brasileiro(a)", value: 1 },
  { title: "estrangeiro(a)", value: 2 },
];

export const MARITAL_STATUS = [
  { title: "Solteiro(a)", value: 1 },
  { title: "Casado(a)", value: 2 },
  { title: "Divorciado(a)", value: 3 },
  { title: "Viúvo(a)", value: 4 },
  { title: "União Estável", value: 5 },
  { title: "Outro", value: 6 },
];

export const ADDRESS_TYPE = [
  { title: "Principal", value: 1 },
  { title: "Secundário", value: 2 },
  { title: "Outro", value: 3 },
];

export const CONTACT_HISTORY_CHANNEL = [
  { title: "Celular", value: 1 },
  { title: "WhatsApp", value: 2 },
  { title: "E-mail", value: 3 },
  { title: "Instagram", value: 4 },
  { title: "Facebook", value: 5 },
  { title: "Pessoalmente", value: 6 },
  { title: "Outro", value: 7 },
];

export const CONTACT_HISTORY_REASONS = [
  { title: "Associação", value: 1 },
  { title: "Cursos", value: 2 },
  { title: "Venda de Arma", value: 3 },
  { title: "Venda de Produto", value: 4 },
  { title: "Documentos", value: 5 },
  { title: "Pagamento", value: 6 },
  { title: "Crétidos", value: 7 },
  { title: "Eventos", value: 8 },
  { title: "Outro", value: 9 },
];

export const WEAPON_ORIGIN = [
  { title: "Exército Brasileiro", value: 1 },
  { title: "Polícia Federal", value: 2 },
  { title: "Ainda não registrada", value: 3 },
];
export const WEAPON_ORIGIN_OR_CLUB = [
  { title: "Loja", value: 1 },
  { title: "Clube", value: 2 },
  { title: "Ainda não registrada", value: 3 },
];

export const WEAPON_STATUS_PF = [
  { title: "Aguardando Entrega", value: 1 },
  { title: "Aguardando Nota Fiscal", value: 2 },
  { title: "Aguardando Aut. Compra", value: 3 },
  { title: "Aguardando Registro", value: 4 },
  { title: "Aguardando Posse", value: 5 },
  { title: "Aguardando Porte", value: 6 },
  { title: "Aguardando Guia de Tráfego", value: 7 },
  { title: "Registrada", value: 8 },
];

export const WEAPON_STATUS_EB = [
  { title: "Aguardando Entrega", value: 1 },
  { title: "Aguardando Nota Fiscal", value: 2 },
  { title: "Aguardando Aut. Compra", value: 3 },
  { title: "Aguardando CRAF", value: 4 },
  { title: "Aguardando Guia de Tráfego", value: 5 },
  { title: "Apostilada", value: 6 },
];

export const PFA_COVERAGE = [
  { title: "Não Disponível", value: 99 },
  { title: "AC - Acre", value: 1 },
  { title: "AL - Alagoas", value: 2 },
  { title: "AP - Amapá", value: 3 },
  { title: "AM - Amazonas", value: 4 },
  { title: "BA - Bahia", value: 5 },
  { title: "CE - Ceará", value: 6 },
  { title: "DF - Distrito Federal", value: 7 },
  { title: "ES - Espirito Santo", value: 8 },
  { title: "GO - Goiás", value: 9 },
  { title: "MA - Maranhão", value: 10 },
  { title: "MS - Mato Grosso do Sul", value: 11 },
  { title: "MT - Mato Grosso", value: 12 },
  { title: "MG - Minas Gerais", value: 13 },
  { title: "PA - Pará", value: 14 },
  { title: "PB - Paraíba", value: 15 },
  { title: "PR - Paraná", value: 16 },
  { title: "PE - Pernambuco", value: 17 },
  { title: "PI - Piauí", value: 18 },
  { title: "RJ - Rio de Janeiro", value: 19 },
  { title: "RN - Rio Grande do Norte", value: 20 },
  { title: "RS - Rio Grande do Sul", value: 21 },
  { title: "RO - Rondônia", value: 22 },
  { title: "RR - Roraima", value: 23 },
  { title: "SC - Santa Catarina", value: 24 },
  { title: "SP - São Paulo", value: 25 },
  { title: "SE - Sergipe", value: 26 },
  { title: "TO - Tocantins", value: 27 },
];

export const TYPE_PRODUCT = [
  { title: "Anuidade", value: 11 },
  { title: "Arma Loja", value: 24 },
  { title: "Assessoria EB", value: 14 },
  { title: "Assessoria PF", value: 15 },
  { title: "Bancada", value: 16 },
  { title: "Bar", value: 3 },
  { title: "Campeonato (terceiro)", value: 21 },
  { title: "Clínica", value: 20 },
  { title: "Curso terceiro", value: 5 },
  { title: "Experience", value: 25 },
  { title: "Introdução", value: 13 },
  { title: "Loja vestuário/acessórios", value: 1 },
  { title: "Munição Clube", value: 2 },
  { title: "Munição Loja", value: 7 },
  { title: "Pacote de munição", value: 22 },
  { title: "Personal", value: 18 },
  { title: "Pista (Campeonato)", value: 17 },
  { title: "Renovação de anuidade", value: 12 },
  { title: "Serviços GTC", value: 4 },
  { title: "Teste tiro", value: 19 },
  { title: "Venda Antecipada", value: 8 },
];
export const SITUATION_PRODUCT = [
  { title: "Ativo", value: 1 },
  { title: "Inativo", value: 2 },
];
export const BOND = [
  { title: "Policia Federal", value: 1 },
  { title: "Exército Brasileiro", value: 2 },
  { title: "Administração", value: 3 },
  { title: "Nenhum", value: 4 },
];

export const FINANCIAL_OPERATION = [
  { title: "Débito", value: 1 },
  { title: "Crédito", value: 2 },
];

export const FINANCIAL_OPERATION_WALLET = [
  { title: "Débito", value: 1 },
  { title: "Crédito", value: 2 },
  { title: "Produto", value: 3 },
];

export const FINANCIAL_OPERATION_ENUM = {
  DEBIT: FINANCIAL_OPERATION[0].value,
  CREDIT: FINANCIAL_OPERATION[1].value,
  PRODUCT: 3,
};

export const ORIGIN_WEAPON = [
  { title: "Clube", value: 1 },
  { title: "Associado", value: 2 },
  { title: "Loja", value: 3 },
];

export const PAYMENT_METHODS = [
  { title: "Débito", value: 1 },
  { title: "Crédito", value: 2 },
  { title: "Dinheiro", value: 3 },
  { title: "PIX", value: 4 },
  { title: "Inventário/Saldo - Associado", value: 5 },
  { title: "Mista", value: 6 },
];
export const CATEGORY_OPTIONS = [
  { title: "Caçador", value: 1 },
  { title: "Atirador Esportivo", value: 2 },
  { title: "Colecionador", value: 3 },
  { title: "Atirador Pressão", value: 4 },
  { title: "Recarga", value: 5 },
  { title: "Procurador", value: 6 },
  { title: "Posse - PF", value: 7 },
  { title: "Porte - PF", value: 8 },
];
export const INTERNAL_USER_TYPE = [
  { title: "Filiado", value: 1 },
  { title: "Visitante", value: 2 },
  { title: "Curso", value: 3 },
  { title: "Amigo Sócio", value: 5 },
  { title: "Cônjuge", value: 6 },
  // { title: "Dependente", value: 7 },
  { title: "Funcionário", value: 8 },
  { title: "Diretor", value: 9 },
  { title: "Não informado", value: 4 },
];
export const USER_STATUS = [
  { title: "Ativo", value: true },
  { title: "Inativo", value: false },
];
export const SCHOOLING_TYPE = [
  { title: "Fundamental - Incompleto", value: 1 },
  { title: "Fundamental - Completo", value: 2 },
  { title: "Médio - Incompleto", value: 3 },
  { title: "Médio - Completo", value: 4 },
  { title: "Superior - Incompleto", value: 5 },
  { title: "Superior - Completo", value: 6 },
  { title: "Pós-graduação - Incompleto", value: 7 },
  { title: "Pós-graduação - Completo", value: 8 },
];
export const GENDER_TYPE = [
  { title: "Masculino", value: 1 },
  { title: "Feminino", value: 2 },
  { title: "Outros", value: 3 },
];

export const OPTIONS_ADVICE = [
  { title: "D", value: "D" },
  { title: "E", value: "E" },
  { title: "F", value: "F" },
  { title: "S", value: "S" },
  { title: "V", value: "V" },
  { title: "OK", value: "OK" },
  { title: "Fun", value: "Fun" },
];

export const getEnumTitle = (enumName, value) => {
  const item = enumName.find((item) => item.value === value);

  if (item) {
    return item.title;
  }
};

export const getEnumValueByTitle = (enumName, title) => {
  const item = enumName.find((item) => item.title === title);

  if (item) {
    return item.value;
  }
};

export const getOriginColor = (origin) => {
  if (origin === 1) {
    return "store";
  }

  if (origin === 2) {
    return "ammunition";
  }

  if (origin === 3) {
    return "coffee";
  }
  if (origin === 4) {
    return "service";
  }
  if (origin === 5) {
    return "event";
  }
  if (origin === 6) {
    return "championship";
  }
  if (origin === 7) {
    return "ammunitionHard";
  }
  if (origin === 8) {
    return "ammunitionHard";
  }
  if (origin === 9) {
    return "service";
  }
  if (origin === 10) {
    return "service";
  }

  if (origin === 11) {
    return "annuity";
  }
  if (origin === 12) {
    return "renewalAnnuity";
  }
  if (origin === 13) {
    return "introduction";
  }
  if (origin === 14) {
    return "accessory";
  }
  if (origin === 15) {
    return "accessory";
  }
  if (origin === 16) {
    return "bench";
  }
  if (origin === 17) {
    return "track";
  }
  if (origin === 18) {
    return "personal";
  }
  if (origin === 19) {
    return "testShot";
  }
  if (origin === 20) {
    return "clinic";
  }
  if (origin === 21) {
    return "thirdChampionship";
  }
  if (origin === 23) {
    return "package";
  }
  if (origin === 24) {
    return "ammunitionHard";
  }
  if (origin === 25) {
    return "experience";
  }
};

export const getStatusColor = (status) => {
  if (status === 1) {
    return "success";
  }

  if (status === 2) {
    return "error";
  }
};
export const getBondColor = (status) => {
  if (status === 1) {
    return "pf";
  }

  if (status === 2) {
    return "eb";
  }

  if (status === 3) {
    return "store";
  }
};

export const getWeaponSystemColor = (origin) => {
  if (origin === 1) {
    return "eb";
  }
  if (origin === 2) {
    return "pf";
  }
};
export const getWeaponOriginColor = (origin) => {
  if (origin === 1) {
    return "experience";
  }
  if (origin === 2) {
    return "service";
  }
  if (origin === 3) {
    return "event";
  }
};

export const getAddressColor = (type) => {
  if (type === 1) {
    return "success";
  }

  if (type === 2) {
    return "secondary";
  }

  if (type === 3) {
    return "other";
  }
};

export const getFinancialColor = (type) => {
  if (type === 1) {
    return "error";
  }

  if (type === 2) {
    return "success";
  }

  if (type === 3) {
    return "info";
  }
};

export const getPaymentForm = (paymentForm) => {
  if (paymentForm === 1) {
    return "Débito";
  }

  if (paymentForm === 2) {
    return "Crédito";
  }

  if (paymentForm === 3) {
    return "Dinheiro";
  }
  if (paymentForm === 4) {
    return "PIX";
  }
  if (paymentForm === 5) {
    return "Saldo";
  }
  if (paymentForm === 6) {
    return "Mista";
  }
};

export const getPaymentFormIcon = (paymentForm) => {
  if (paymentForm === 1) {
    return (
      <img
        src="/static/icons/payment_form/credit-debit-card.svg"
        style={{ width: 35, height: 35 }}
      />
    );
  }

  if (paymentForm === 2) {
    return (
      <img
        src="/static/icons/payment_form/credit-debit-card.svg"
        style={{ width: 35, height: 35 }}
      />
    );
  }

  if (paymentForm === 3) {
    return (
      <img
        src="/static/icons/payment_form/money.svg"
        style={{ width: 35, height: 35 }}
      />
    );
  }
  if (paymentForm === 4) {
    return (
      <img
        src="/static/icons/payment_form/pix.svg"
        style={{ width: 35, height: 35 }}
      />
    );
  }
  if (paymentForm === 5) {
    return (
      <img
        src="/static/icons/payment_form/wallet.svg"
        style={{ width: 35, height: 35 }}
      />
    );
  }
  if (paymentForm === 6) {
    return (
      <img
        src="/static/icons/payment_form/mista.svg"
        style={{ width: 35, height: 35 }}
      />
    );
  }
};

export const verifyTypeUser = (user) => {
  if (user === 1) {
    return "Filiado";
  }
  if (user === 2) {
    return "Visitante";
  }
  if (user === 3) {
    return "Curso";
  }
  if (user === 4) {
    return "Não informado";
  }
  if (user === 5) {
    return "Amigo(a) Sócio";
  }
  if (user === 6) {
    return "Cônjuge";
  }
  if (user === 7) {
    return "Dependente";
  }
  if (user === 8) {
    return "Funcionário(a)";
  }
  if (user === 9) {
    return "Diretor";
  }
  if (user === undefined) {
    return "--------";
  }
};
export const FIREARM_CALIBERS = [
  { title: "9mm", value: 1 },
  { title: ".380", value: 2 },
  { title: ".45", value: 3 },
  { title: ".38", value: 4 },
  { title: ".357", value: 5 },
  { title: "5.56", value: 6 },
  { title: "7.62", value: 7 },
  { title: "12 gauge", value: 8 },
  { title: "20 gauge", value: 9 },
  { title: ".40 S&W", value: 10 },
  { title: ".44 Magnum", value: 11 },
  { title: ".223", value: 12 },
  { title: "6.5mm Creedmoor", value: 13 },
  { title: "7mm Remington Magnum", value: 14 },
  { title: "30-06 Springfield", value: 15 },
  { title: ".308 Winchester", value: 16 },
  { title: ".270 Winchester", value: 17 },
  { title: ".243 Winchester", value: 18 },
  { title: "6.5mm Grendel", value: 19 },
  { title: "7.62x39mm", value: 20 },
  { title: ".50 BMG", value: 21 },
  { title: ".338 Lapua", value: 22 },
  { title: ".22 LR", value: 23 },
  { title: ".17 HMR", value: 24 },
  { title: ".223 Wylde", value: 25 },
  { title: "10mm Auto", value: 26 },
  { title: ".32 ACP", value: 27 },
  { title: ".25 ACP", value: 28 },
  { title: ".44 Special", value: 29 },
  { title: ".41 Magnum", value: 30 },
  { title: "20mm", value: 31 },
];

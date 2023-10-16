// routes
import { PATH_DASHBOARD } from "../../routes/paths";
// components
import SvgIconStyle from "../../components/SvgIconStyle";
import { urlToPageId } from "src/utils/url";

// ----------------------------------------------------------------------

const getIcon = (name) => (
  <SvgIconStyle
    src={`/static/icons/navbar/${name}.svg`}
    sx={{ width: "100%", height: "100%" }}
  />
);

const ICONS = {
  home: getIcon("ic_home"),
  user: getIcon("ic_user"),
  file: getIcon("ic_file"),
  kanban: getIcon("ic_kanban"),
  calendar: getIcon("ic_calendar"),
  form: getIcon("ic_form"),
  history: getIcon("ic_history"),
  list: getIcon("ic_list"),
  event: getIcon("ic_event"),
  weapon: getIcon("ic_fire-weapon"),
  folderPlus: getIcon("ic_folder-plus"),
  marketing: getIcon("ic_marketing"),
  commission: getIcon("ic_marketing"),
};

const sidebarConfig = [
  {
    items: [
      {
        id: urlToPageId(PATH_DASHBOARD.general.home),
        title: "Dashboard",
        path: PATH_DASHBOARD.general.home,
        icon: ICONS.home,
      },
    ],
  },
  // AÇÕES
  // ----------------------------------------------------------------------
  {
    subheader: "Ações",
    items: [
      {
        id: urlToPageId(PATH_DASHBOARD.actions.invoices),
        title: "Comandas",
        path: PATH_DASHBOARD.actions.invoices,
        icon: ICONS.kanban,
      },
      {
        id: urlToPageId(PATH_DASHBOARD.actions.schedules),
        title: "Agendamentos",
        path: PATH_DASHBOARD.actions.schedules,
        icon: ICONS.calendar,
      },
      {
        id: urlToPageId(PATH_DASHBOARD.actions.army_form),
        title: "Exército",
        path: PATH_DASHBOARD.actions.army_form,
        icon: ICONS.form,
      },
    ],
  },

  // ASSOCIADOS
  // ----------------------------------------------------------------------
  {
    subheader: "Associados",
    items: [
      {
        id: urlToPageId(PATH_DASHBOARD.associates.register),
        title: "Cadastro",
        path: PATH_DASHBOARD.associates.register,
        icon: ICONS.list,
      },
      {
        id: urlToPageId(PATH_DASHBOARD.associates.history),
        title: "Histórico",
        path: PATH_DASHBOARD.associates.history,
        icon: ICONS.history,
      },
    ],
  },

  // OPERAÇÃO INTERNA
  // ----------------------------------------------------------------------
  {
    subheader: "Operação Interna",
    items: [
      {
        id: urlToPageId(PATH_DASHBOARD.internal_operation.user),
        title: "Usuários",
        path: PATH_DASHBOARD.internal_operation.user,
        icon: ICONS.user,
      },
      {
        id: urlToPageId(PATH_DASHBOARD.internal_operation.events),
        title: "Eventos",
        path: PATH_DASHBOARD.internal_operation.events,
        icon: ICONS.event,
      },
      {
        id: urlToPageId(PATH_DASHBOARD.internal_operation.createProduct),
        title: "Produtos",
        path: PATH_DASHBOARD.internal_operation.createProduct,
        icon: ICONS.folderPlus,
      },
      {
        id: urlToPageId(PATH_DASHBOARD.internal_operation.createWeapon),
        title: "Armas",
        path: PATH_DASHBOARD.internal_operation.createWeapon,
        icon: ICONS.weapon,
      },
      {
        id: urlToPageId(PATH_DASHBOARD.internal_operation.marketing),
        title: "Marketing",
        path: PATH_DASHBOARD.internal_operation.marketing,
        icon: ICONS.marketing,
      },
      {
        id: urlToPageId(PATH_DASHBOARD.internal_operation.commission),
        title: "Comissão",
        path: PATH_DASHBOARD.internal_operation.commission,
        icon: ICONS.commission,
      },
    ],
  },
];

export default sidebarConfig;

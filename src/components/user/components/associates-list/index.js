import React, { useState } from "react";
import NextLink from "src/components/Button/Link";
import PropTypes from "prop-types";
import Toast from "src/utils/toast";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import Label from "src/components/Label";
import { useSelector } from "react-redux";
import { styled } from "@material-ui/styles";
import Confirm from "src/components/Confirm";
import history from "@iconify/icons-ic/history";
import { useAuthUser } from "next-firebase-auth";
import { CircularProgress } from "@material-ui/core";
import whatsApp from "@iconify/icons-ic/baseline-whatsapp";
import { formatCpf, formatPhone } from "src/utils/string";
import baselineEdit from "@iconify/icons-ic/baseline-edit";
import { getDateLocalized } from "src/utils/localizedDateFns";
import baselineDelete from "@iconify/icons-ic/baseline-delete";
import {
  Card,
  Table,
  Tooltip,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  TableContainer,
  Button as MuiButton,
} from "@material-ui/core";
const Button = styled(MuiButton)(({ theme }) => ({
  textTransform: "none",
}));

const AssocietesList = ({ associatesList, isLoading, onDelete }) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [deleteData, setDeleteData] = useState({});

  const router = useRouter();

  const onDeleteConfirm = async () => {
    try {
      setIsLoadingDelete(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/associate/data", {
        method: "DELETE",
        body: JSON.stringify({
          id: deleteData.objectID,
          deletedBy: userInfo.id,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsOpenDeleteDialog(false);
        onDelete(true);
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoadingDelete(false);
  };

  const onDeleteClick = (item) => {
    setIsOpenDeleteDialog(true);
    setDeleteData(item);
  };

  const getTypeColor = (active) => {
    if (active === true) {
      return "success";
    }

    if (active === false) {
      return "error";
    }
  };

  const getObservationColor = (createdBy) => {
    if (createdBy === "robot") {
      return "warning";
    }

    return "info";
  };

  const getInternalUser = (type) => {
    if (type === 1) {
      return "Filiado";
    }

    if (type === 2) {
      return "Visitante";
    }
    if (type === 3) {
      return "Curso";
    }
    if (type === 4) {
      return "N/I";
    }
    if (type === 5) {
      return "Amigo Sócio";
    }
    if (type === 6) {
      return "Cônjuge";
    }
    if (type === 7) {
      return "Dependente";
    }
    if (type === 8) {
      return "Funcionário";
    }
    if (type === 9) {
      return "Diretor";
    }

    return "-----";
  };

  const getInternalUserColor = (internalUserType) => {
    if (internalUserType === 1) {
      return "success";
    }
    if (internalUserType === 2) {
      return "warning";
    }
    if (internalUserType === 3) {
      return "secondary";
    }
    if (internalUserType === 5) {
      return "info";
    }
    if (internalUserType === 6) {
      return "success";
    }
    if (internalUserType === 7) {
      return "secondary";
    }
    if (internalUserType === 8) {
      return "success";
    }
    if (internalUserType === 9) {
      return "info";
    }

    return "default";
  };

  const onCopy = (text, format) => {
    navigator.clipboard.writeText(text);

    let newText = text;

    if (format === "cpf") {
      newText = formatCpf(text);
    }

    if (format === "phone") {
      newText = formatPhone(text);
    }

    Toast.success(`${newText} copiado com sucesso!`, {
      position: "bottom-center",
    });
  };

  return (
    <>
      <Card sx={{ mt: 5 }} style={{ minHeight: 500 }}>
        <TableContainer sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="10%">Filiação</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Venc. Anuidade</TableCell>
                <TableCell>CPF</TableCell>
                <TableCell>Data de cadastro</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Última alteração</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                {/* <TableCell></TableCell> */}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <div
                  style={{
                    position: "absolute",
                    fontSize: 18,
                    padding: 58,
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  <CircularProgress />
                  <br />
                  <br />
                  Carregando...
                </div>
              )}

              {!isLoading && associatesList.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    fontSize: 18,
                    padding: 58,
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  Nenhum item encontrado :(
                </div>
              )}

              {!isLoading &&
                associatesList.map((associate, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Button
                        size="small"
                        color="inherit"
                        href={`/associates/register/${associate.objectID}`}
                      >
                        {associate.affiliationNumber}
                      </Button>
                    </TableCell>
                    <Tooltip
                      title={`Celular: ` + formatPhone(associate.phoneNumber)}
                    >
                      <TableCell>
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => {
                            onCopy(associate.phoneNumber, "phone");
                          }}
                        >
                          {associate.name}
                        </Button>
                      </TableCell>
                    </Tooltip>
                    <TableCell>
                      {associate.nextPayment
                        ? getDateLocalized(
                            new Date(associate.nextPayment),
                            "dd/MM/yyyy"
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => onCopy(associate.cpf, "cpf")}
                      >
                        {formatCpf(associate.cpf)}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {getDateLocalized(
                        new Date(associate.affiliationDate),
                        "dd/MM/yyyy"
                      )}
                    </TableCell>

                    <TableCell>
                      <Label
                        variant="filled"
                        color={getTypeColor(associate.active)}
                      >
                        {associate.active ? "Ativo" : "Inativo"}
                      </Label>
                    </TableCell>

                    <TableCell>
                      {associate.modifiedDate
                        ? getDateLocalized(
                            new Date(associate.modifiedDate),
                            "dd/MM/yyyy"
                          )
                        : "------"}
                    </TableCell>

                    <TableCell>
                      <Label
                        variant="filled"
                        color={getInternalUserColor(associate.internalUserType)}
                      >
                        {getInternalUser(associate.internalUserType)}
                      </Label>
                    </TableCell>

                    <TableCell>
                      <NextLink
                        href={`/associates/register/${associate.objectID}`}
                      >
                        <Tooltip title="Ver/Editar">
                          <IconButton>
                            <Icon icon={baselineEdit} />
                          </IconButton>
                        </Tooltip>
                      </NextLink>
                    </TableCell>

                    <TableCell>
                      <NextLink
                        href={`/associates/register/${associate.objectID}/history`}
                        passHref
                      >
                        <Tooltip title="Histórico">
                          <IconButton>
                            <Icon icon={history} />
                          </IconButton>
                        </Tooltip>
                      </NextLink>
                    </TableCell>
                    {/* <TableCell>
                      <NextLink
                        href={`https://api.whatsapp.com/send?phone=${associate.phoneNumber}`}
                      >
                        <a target="_blanck">
                          <Tooltip title="Whatsapp">
                            <IconButton>
                              <Icon icon={whatsApp} />
                            </IconButton>
                          </Tooltip>
                        </a>
                      </NextLink>
                    </TableCell> */}

                    <TableCell align="center">
                      <Tooltip title="Excluir">
                        <IconButton onClick={() => onDeleteClick(associate)}>
                          <Icon icon={baselineDelete} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Confirm
        isLoading={isLoadingDelete}
        open={isOpenDeleteDialog}
        cancelText="Fechar"
        onCancel={() => setIsOpenDeleteDialog(false)}
        onConfirm={onDeleteConfirm}
        description={`Você tem certeza que deseja excluir o associado ${deleteData.name}?`}
      />
    </>
  );
};

AssocietesList.propTypes = {
  userInfo: PropTypes.array,
};

export default AssocietesList;

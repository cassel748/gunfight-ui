import React, { useState } from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import baselineEdit from "@iconify/icons-ic/baseline-edit";
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
} from "@material-ui/core";
import { USER_TYPE_DESCRIPTION } from "src/utils/auth";
import { DialogAnimate } from "src/components/animate";
import FormNewUser from "../form-new-user";
import Confirm from "src/components/Confirm";
import { CircularProgress } from "@material-ui/core";
import Label from "src/components/Label";
import { useAuthUser } from "next-firebase-auth";
import { useSelector } from "react-redux";

const UserList = ({ userList, onDelete, onFinishEdit, isLoading }) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  const editItem = (user) => {
    setIsOpenEditDialog(true);
    setCurrentUser(user);
  };

  const closeEditDialog = (fromEditOrSave) => {
    setIsOpenEditDialog(false);
    onFinishEdit(fromEditOrSave);
  };

  const deleteItem = (user) => {
    setIsOpenDeleteDialog(true);
    setCurrentUser(user);
  };

  const onDeleteConfirm = async () => {
    try {
      setIsLoadingDelete(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/user", {
        method: "DELETE",
        body: JSON.stringify({
          docId: currentUser.docId,
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

  const getTypeColor = (active) => {
    if (active === true) {
      return "success";
    }

    if (active === false) {
      return "error";
    }
  };

  return (
    <>
      <Card sx={{ mt: 5 }} style={{ minHeight: 500 }}>
        <TableContainer sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>

                <TableCell></TableCell>
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

              {!isLoading && userList.length === 0 && (
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
                userList.map((user, index) => {
                  if (user.name === "Validador") {
                    return null;
                  }

                  return (
                    <TableRow key={index}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {USER_TYPE_DESCRIPTION[user.accessLevel]}
                      </TableCell>
                      <TableCell>
                        <Label variant="filled" color={getTypeColor(user.active)}>
                          {user.active ? "Ativo" : "Inativo"}
                        </Label>
                      </TableCell>

                      <TableCell width={60}>
                        <Tooltip title="Editar">
                          <IconButton onClick={() => editItem(user)}>
                            <Icon icon={baselineEdit} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" width={60}>
                        <Tooltip title="Excluir">
                          <IconButton onClick={() => deleteItem(user)}>
                            <Icon icon={baselineDelete} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <DialogAnimate
        open={isOpenEditDialog}
        onClose={closeEditDialog}
        widthMax={800}
      >
        <FormNewUser onClose={closeEditDialog} currentUser={currentUser} />
      </DialogAnimate>

      <Confirm
        isLoading={isLoadingDelete}
        open={isOpenDeleteDialog}
        cancelText="Fechar"
        onCancel={() => setIsOpenDeleteDialog(false)}
        onConfirm={onDeleteConfirm}
        description={`Você tem certeza que deseja excluir o usuário ${currentUser.name}?`}
      />
    </>
  );
};

UserList.propTypes = {
  userList: PropTypes.array,
};

export default UserList;

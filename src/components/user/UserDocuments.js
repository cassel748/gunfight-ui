import React, { useEffect, useState } from "react";
import Confirm from "../Confirm";
import Add from "@material-ui/icons/Add";
import { DialogAnimate } from "../animate";
import DocsPack from "./components/docs-pack";
import { LoadingButton } from "@material-ui/lab";
import DocumentsList from "./components/documents-list";
import FormDocuments from "./components/form-documents";
import { Typography, Grid, Stack, Card } from "@material-ui/core";
import { useAuthUser } from "next-firebase-auth";
import { useSelector } from "react-redux";
import { DOCUMENTS, getEnumTitle } from "src/utils/enums";

export default function UserDocuments({ userId }) {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [documentsList, setDocumentsList] = useState([]);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [currentDocument, setCurrentDocument] = useState({});

  const deleteItem = (document) => {
    setIsOpenDeleteDialog(true);
    setCurrentDocument(document);
  };

  const deleteClose = () => {
    setIsOpenDeleteDialog(false);
    setCurrentDocument({});
  };

  const handleOpenEdit = () => {
    setIsOpenEditDialog(true);
  };

  const handleEditDocument = (doc) => {
    setCurrentDocument(doc);
    setIsOpenEditDialog(true);
  };

  const handleCloseEdit = (shouldReload) => {
    setIsOpenEditDialog(false);
    setCurrentDocument({});

    if (shouldReload === true) {
      performSearch();
    }
  };

  const performSearch = async () => {
    try {
      setIsLoadingList(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch(
        `/api/associate/documents?associateId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();
      setDocumentsList(data);
    } catch (e) {
      console.log(e);
    }
    setIsLoadingList(false);
  };

  useEffect(() => {
    performSearch();
  }, []);

  const onDeleteConfirm = async () => {
    try {
      setIsLoadingDelete(true);

      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/associate/documents", {
        method: "DELETE",
        body: JSON.stringify({
          docId: currentDocument.docId,
          deletedBy: userInfo.id,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsOpenDeleteDialog(false);
        performSearch();
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoadingDelete(false);
    setCurrentDocument({});
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={{ p: 3 }} style={{ minHeight: 500 }}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
              justifyContent: "space-between",
            }}
            spacing={{ xs: 3, sm: 2 }}
            mb={3}
          >
            <Typography variant="h5" paragraph>
              Lista de Documentos
            </Typography>
            <LoadingButton
              type="button"
              size="medium"
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenEdit}
            >
              Novo
            </LoadingButton>
          </Stack>

          <DocumentsList
            docs={documentsList}
            deleteItem={deleteItem}
            isLoading={isLoadingList}
            handleEditDocument={handleEditDocument}
          />
        </Card>
      </Grid>

      {/*<Grid item xs={12} md={4}>
        <Stack spacing={3}>
          <DocsPack />
        </Stack>
      </Grid>*/}

      <DialogAnimate
        widthMax={800}
        open={isOpenEditDialog}
        onClose={handleCloseEdit}
      >
        <FormDocuments
          userId={userId}
          handleClose={handleCloseEdit}
          currentDocument={currentDocument}
        />
      </DialogAnimate>

      <Confirm
        open={isOpenDeleteDialog}
        onCancel={deleteClose}
        onConfirm={onDeleteConfirm}
        title="Excluir endereço"
        description={`Tem certeza que deseja excluir o documento ${getEnumTitle(
          DOCUMENTS,
          currentDocument.type
        )}?`}
        isLoading={isLoadingDelete}
      />
    </Grid>
  );
}

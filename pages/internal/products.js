import { useEffect, useState } from "react";
import Toast from "src/utils/toast";
import Page from "src/components/Page";
import Add from "@material-ui/icons/Add";
import { useSelector } from "react-redux";
import { Print } from "@material-ui/icons";
import { printFile } from "src/utils/file";
import Confirm from "src/components/Confirm";
import { withAuthLevel } from "src/utils/auth";
import { LoadingButton } from "@material-ui/lab";
import DashboardLayout from "src/layouts/dashboard";
import { DialogAnimate } from "src/components/animate";
import PictureAsPdf from "@material-ui/icons/PictureAsPdf";
import FormProduct from "src/components/internal-operation/products/form";
import ListProducts from "src/components/internal-operation/products/list";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import ProductsFilter from "src/components/internal-operation/products/filter";
import { getEnumTitle, TYPE_PRODUCT, SITUATION_PRODUCT } from "src/utils/enums";
import {
  Box,
  Stack,
  Menu,
  MenuItem,
  Container,
  Pagination,
  Typography,
} from "@material-ui/core";

// ----------------------------------------------------------------------

const Products = () => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);
  const [pages, setPages] = useState(0);
  const [actualPage, setActualPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openPrint, setOpenPrint] = useState(false);
  const [actualFilter, setActualFilter] = useState(null);
  const [productsItems, setProductsItems] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({});
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isOpenNewDialog, setIsOpenNewDialog] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const deleteItem = (product) => {
    setIsOpenDeleteDialog(true);
    setCurrentProduct(product);
  };

  const deleteCloseDialog = () => {
    setIsOpenDeleteDialog(false);
    setCurrentProduct({});
  };

  const closeNewDialog = (shouldReload) => {
    setIsOpenNewDialog(false);
    if (shouldReload === true) {
      performSearch(actualFilter, 1);
    }
  };

  const handleOpenEdit = (product) => {
    setIsOpenNewDialog(true);

    if (product) {
      setCurrentProduct(product);
    }
  };

  const performSearch = async (values, page) => {
    try {
      setIsLoadingList(true);

      let url = "/api/internal/products";
      const queryParams = new URLSearchParams();

      queryParams.append("limit", 10);
      queryParams.append("page", page);

      if (values?.title) {
        queryParams.append("title", values.title);
      }
      if (values?.productCode) {
        queryParams.append("productCode", values.productCode);
      }
      if (values?.size) {
        queryParams.append("size", values.size);
      }
      if (values?.origin) {
        queryParams.append("origin", values.origin);
      }
      if (values?.situation) {
        queryParams.append("situation", values.situation);
      }
      if (values?.type) {
        queryParams.append("type", values.type);
      }

      const searchQuery = queryParams.toString();

      if (searchQuery) {
        url = `${url}?${searchQuery}`;
      }

      const token = await AuthUser.getIdToken();
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      setProductsItems(data.results);
      setPages(data.pagination.pages);
      setActualPage(page);
    } catch (e) {
      console.log(e);
      setProductsItems([]);
    }
    setIsLoadingList(false);
  };

  useEffect(() => {
    performSearch(null, 1);
  }, []);

  const onDeleteConfirm = async () => {
    try {
      setIsLoadingDelete(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/internal/products", {
        method: "DELETE",
        body: JSON.stringify({
          docId: currentProduct.docId,
          deletedBy: userInfo.id,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data.success) {
        Toast.success("Produto removido com sucesso!");
        setIsOpenDeleteDialog(false);
        performSearch(null, 1);
      }
    } catch (e) {
      Toast.error("Ocorreu um erro ao remover o produto!");
      console.log(e);
    }
    setIsOpenDeleteDialog(false);
    setIsLoadingDelete(false);
  };

  const handlePageChange = (event, value) => {
    performSearch(actualFilter, value);
    setActualPage(value);
  };

  const onFilter = (values) => {
    setActualFilter(values);
    if (!values) {
      return performSearch(values, 1);
    }

    performSearch(values, actualPage);
  };

  const handleOpenPrint = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenPrint(true);
  };

  const handleClosePrint = () => {
    setAnchorEl(null);
    setOpenPrint(false);
  };

  const handlePrint = async (type) => {
    setOpenPrint(false);
    try {
      setLoading(true);

      if (type === "pdf") {
        await printFile(`/api/reports/products`, {});
      } else {
        await printFile(`/api/reports/products/excel`, {}, "xlsx", "produtos");
      }
    } catch (e) {
      console.log(e);
      Toast.error("Erro ao gerar o arquivo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Page title="Produtos">
        <Container maxWidth="xl">
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
              Produtos
            </Typography>
            <div>
              <LoadingButton
                type="button"
                size="medium"
                variant="outlined"
                startIcon={<Print />}
                style={{ marginRight: 12 }}
                id="print-button"
                aria-controls={openPrint ? "print-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openPrint ? "true" : undefined}
                loading={loading}
                onClick={handleOpenPrint}
              >
                Imprimir
              </LoadingButton>

              <Menu
                id="print-menu"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                open={openPrint}
                onClose={handleClosePrint}
                MenuListProps={{
                  "aria-labelledby": "print-button",
                }}
                style={{ marginTop: 4, marginLeft: -100 }}
              >
                <MenuItem style={{ minWidth: 215 }} onClick={handlePrint}>
                  <svg
                    fill="#ffffff"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 50 50"
                    width="20px"
                    height="20px"
                  >
                    <path d="M 28.875 0 C 28.855469 0.0078125 28.832031 0.0195313 28.8125 0.03125 L 0.8125 5.34375 C 0.335938 5.433594 -0.0078125 5.855469 0 6.34375 L 0 43.65625 C -0.0078125 44.144531 0.335938 44.566406 0.8125 44.65625 L 28.8125 49.96875 C 29.101563 50.023438 29.402344 49.949219 29.632813 49.761719 C 29.859375 49.574219 29.996094 49.296875 30 49 L 30 44 L 47 44 C 48.09375 44 49 43.09375 49 42 L 49 8 C 49 6.90625 48.09375 6 47 6 L 30 6 L 30 1 C 30.003906 0.710938 29.878906 0.4375 29.664063 0.246094 C 29.449219 0.0546875 29.160156 -0.0351563 28.875 0 Z M 28 2.1875 L 28 6.53125 C 27.867188 6.808594 27.867188 7.128906 28 7.40625 L 28 42.8125 C 27.972656 42.945313 27.972656 43.085938 28 43.21875 L 28 47.8125 L 2 42.84375 L 2 7.15625 Z M 30 8 L 47 8 L 47 42 L 30 42 L 30 37 L 34 37 L 34 35 L 30 35 L 30 29 L 34 29 L 34 27 L 30 27 L 30 22 L 34 22 L 34 20 L 30 20 L 30 15 L 34 15 L 34 13 L 30 13 Z M 36 13 L 36 15 L 44 15 L 44 13 Z M 6.6875 15.6875 L 12.15625 25.03125 L 6.1875 34.375 L 11.1875 34.375 L 14.4375 28.34375 C 14.664063 27.761719 14.8125 27.316406 14.875 27.03125 L 14.90625 27.03125 C 15.035156 27.640625 15.160156 28.054688 15.28125 28.28125 L 18.53125 34.375 L 23.5 34.375 L 17.75 24.9375 L 23.34375 15.6875 L 18.65625 15.6875 L 15.6875 21.21875 C 15.402344 21.941406 15.199219 22.511719 15.09375 22.875 L 15.0625 22.875 C 14.898438 22.265625 14.710938 21.722656 14.5 21.28125 L 11.8125 15.6875 Z M 36 20 L 36 22 L 44 22 L 44 20 Z M 36 27 L 36 29 L 44 29 L 44 27 Z M 36 35 L 36 37 L 44 37 L 44 35 Z" />
                  </svg>
                  <span style={{ display: "inline-block", marginLeft: 10 }}>
                    Excel
                  </span>
                </MenuItem>
                {/* <MenuItem onClick={() => handlePrint("pdf")}>
                  <PictureAsPdf />
                  <span style={{ display: "inline-block", marginLeft: 8 }}>
                    PDF
                  </span>
                </MenuItem> */}
              </Menu>
              <LoadingButton
                type="button"
                size="medium"
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenEdit}
              >
                Novo
              </LoadingButton>
            </div>
          </Stack>

          <ProductsFilter onFilter={onFilter} />

          <ListProducts
            products={productsItems}
            deleteItem={deleteItem}
            editItem={handleOpenEdit}
            isLoading={isLoadingList}
          />

          <DialogAnimate
            widthMax={800}
            open={isOpenNewDialog}
            onClose={closeNewDialog}
          >
            <FormProduct
              handleClose={closeNewDialog}
              currentProduct={currentProduct}
            />
          </DialogAnimate>
          
          <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end" }}>
            <Pagination
              count={pages}
              color="primary"
              rowsPerPage={10}
              page={actualPage}
              onChange={handlePageChange}
            />
          </Box>
        </Container>
        <Confirm
          title="Excluir Produto"
          open={isOpenDeleteDialog}
          onCancel={deleteCloseDialog}
          onConfirm={onDeleteConfirm}
          isLoading={isLoadingDelete}
          description={`Você tem certeza que deseja excluir o produto ${
            currentProduct.title
          } ${getEnumTitle(TYPE_PRODUCT, currentProduct.type)} - ${getEnumTitle(
            SITUATION_PRODUCT,
            currentProduct.situation
          )}?`}
        />
      </Page>
    </DashboardLayout>
  );
};

export const getServerSideProps = withAuthLevel();

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Products);

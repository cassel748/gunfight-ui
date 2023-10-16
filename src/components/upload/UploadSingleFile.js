import { isString } from "lodash";
import PropTypes from "prop-types";
import { useDropzone } from "react-dropzone";
import { fData } from "src/utils/formatNumber";
import { Paper, Box, Typography } from "@material-ui/core";
import { alpha, experimentalStyled as styled } from "@material-ui/core/styles";

const DropZoneStyle = styled("div")(({ theme }) => ({
  outline: "none",
  display: "flex",
  overflow: "hidden",
  textAlign: "center",
  position: "relative",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(5, 0),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create("padding"),
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  "&:hover": {
    opacity: 0.72,
    cursor: "pointer",
  },
  [theme.breakpoints.up("md")]: { textAlign: "left", flexDirection: "row" },
}));

// ----------------------------------------------------------------------

UploadSingleFile.propTypes = {
  error: PropTypes.bool,
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  sx: PropTypes.object,
};

export default function UploadSingleFile({ error, file, sx, ...other }) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    acceptedFiles: ["application/pdf", "image/jpg", "image/jpeg", "image/png"],
    maxSize: 1024 * 10 * 1000,
    multiple: false,
    ...other,
  });

  const ShowRejectionItems = () => (
    <Paper
      variant="outlined"
      sx={{
        py: 1,
        px: 2,
        mt: 3,
        borderColor: "error.light",
        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
      }}
    >
      {fileRejections.map(({ file, errors }) => {
        const { path, size } = file;
        return (
          <Box key={path} sx={{ my: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {path} - {fData(size)}
            </Typography>
            {errors.map((e) => (
              <Typography key={e.code} variant="caption" component="p">
                - {e.message}
              </Typography>
            ))}
          </Box>
        );
      })}
    </Paper>
  );

  return (
    <Box sx={{ width: "100%", ...sx }}>
      <DropZoneStyle
        {...getRootProps()}
        sx={{
          ...(isDragActive && { opacity: 0.72 }),
          ...((isDragReject || error) && {
            color: "error.main",
            borderColor: "error.light",
            bgcolor: "error.lighter",
          }),
          ...(file && { padding: "12% 0" }),
        }}
        style={{ flexDirection: 'column'}}
      >
        <input {...getInputProps()} />

        {!file && (
          <Box sx={{ p: 3, ml: { md: 2 } }}>
            <Typography gutterBottom variant="h5" align="center">
              Arraste ou Clique para selecionar o arquivo
            </Typography>

            <Typography variant="body2" sx={{ color: "text.secondary" }} align="center">
              Solte os arquivos aqui ou clique&nbsp;
              <Typography
                variant="body2"
                component="span"
                sx={{ color: "primary.main" }}
              >
                buscar
              </Typography>
              &nbsp;em seu dispositivo
            </Typography>
          </Box>
        )}

        {file && (
          <div style={{textAlign: "center"}}>
            <Typography gutterBottom variant="h5" align="center">
              Selecionado
            </Typography>

            <div>{file.path}</div>

            <Typography variant="body2" sx={{ color: "text.secondary" }} align="center" style={{ paddingTop: 24 }}>
              Clique novamente para substituir &nbsp;
              <Typography
                variant="body2"
                component="span"
                sx={{ color: "primary.main" }}
              >
                substituir
              </Typography>
              &nbsp;o arquivo.
            </Typography>
          </div>
        )}
      </DropZoneStyle>

      {fileRejections.length > 0 && <ShowRejectionItems />}
    </Box>
  );
}

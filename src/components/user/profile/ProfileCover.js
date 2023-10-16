import { Box, Typography } from "@material-ui/core";
import UploadAvatar from "src/components/UploadAvatar";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { useRouter } from "next/router";
import { formatPhone } from "src/utils/string";
import { useCallback, useState } from "react";

const RootStyle = styled("div")(() => ({
  "&:before": {
    top: 0,
    zIndex: 2,
    width: "100%",
    content: "''",
    height: "100%",
    position: "absolute",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(2px)",
  },
}));

const InfoStyle = styled("div")(({ theme }) => ({
  left: 0,
  right: 0,
  zIndex: 99,
  position: "absolute",
  marginTop: theme.spacing(5),
  [theme.breakpoints.up("md")]: {
    right: "auto",
    display: "flex",
    alignItems: "center",
    left: theme.spacing(3),
    top: theme.spacing(5),
  },
}));

const CoverImgStyle = styled("img")({
  zIndex: 1,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute",
});

export default function ProfileCover({ currentUser, onSelectAvatar }) {
  const [filePreview, setFilePreview] = useState(
    currentUser?.profilePhoto
      ? currentUser?.profilePhoto
      : "/static/mock-images/avatars/avatar.jpg"
  );
  const router = useRouter();
  const { id } = router.query;

  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFilePreview(URL.createObjectURL(file));

      if (onSelectAvatar) {
        onSelectAvatar(file);
      }
    }
  }, []);

  return (
    <RootStyle>
      <InfoStyle>
        <UploadAvatar
          accept="image/*"
          maxSize={3145728}
          file={filePreview}
          onDrop={handleDropSingleFile}
        />
        <Box
          sx={{
            ml: { md: 3 },
            mt: { xs: 1, md: 0 },
            color: "common.white",
            textAlign: { xs: "center", md: "left" },
          }}
          style={{ marginTop: -100 }}
        >
          <Typography variant="h4">
            {id === "new" ? "Novo Associado" : currentUser?.name}
          </Typography>

          <Typography sx={{ opacity: 0.82 }}>
            {id === "new" ? "" : formatPhone(currentUser?.phoneNumber)}
          </Typography>
        </Box>
      </InfoStyle>
      <CoverImgStyle
        alt="capa"
        src={"/static/mock-images/register-cover.jpeg"}
      />
    </RootStyle>
  );
}

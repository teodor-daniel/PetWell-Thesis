
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  Image as MantineImage,
  Modal,
  Slider,
  Text,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import {
  IconCircleMinus,
  IconCirclePlus,
  IconCrop,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import axios from "axios";
import { useContext, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { AuthContext } from '../../contexts/AuthContext';
import { useMediaQuery } from '@mantine/hooks';


export default function ImageUploader({ petName, onSuccess }) {
  const { user } = useContext(AuthContext);
  const MAX_FILE   = 5 * 1024 ** 2; 
  const isMobile = useMediaQuery('(max-width: 600px)');
  const CONTAINER = isMobile ? Math.min(window.innerWidth * 0.9, 350) : 650;
  const MIN_CIRCLE = 100;          
  const MAX_CIRCLE = 350;          

  const [rawURL,     setRawURL]     = useState(null);
  const [croppedURL, setCroppedURL] = useState(null);
  const [blob,       setBlob]       = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [open,       setOpen]       = useState(false);

  /* cropper state */
  const [crop,   setCrop]   = useState({ x: 0, y: 0 });
  const [circle,setCircle] = useState(250);
  const pixelsRef        = useRef(null);
  const fileRef          = useRef(null);

  /* ─ handlers ─ */
  const onDrop = (files) => {
    const f = files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return alert("Choose an image file.");
    if (f.size > MAX_FILE)         return alert("Image ≤ 5 MB.");

    fileRef.current = f;
    setRawURL(URL.createObjectURL(f));
    setOpen(true);
  };

  const onCropComplete = (_, areaPx) => {
    pixelsRef.current = areaPx;
  };

  const confirmCrop = async () => {
    const avatar = await buildAvatar(rawURL, pixelsRef.current, circle);
    setBlob(avatar);
    setCroppedURL(URL.createObjectURL(avatar));
    setOpen(false);
  };

  const clear = () => {
    setBlob(null);
    setCroppedURL(null);
    setRawURL(null);
    fileRef.current = null;
  };

  const upload = async () => {
    if (!blob) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append(
        "file",
        new File([blob], `avatar_${Date.now()}.webp`, { type: "image/webp" })
      );
      if (petName) fd.append("petName", petName);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload/image`,
        fd,
        {
          withCredentials: true,
        }
      );

      onSuccess?.();
      clear();
    } catch (e) {
      console.error(e);
      alert("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Dropzone
        onDrop={onDrop}
        accept={{ "image/*": [] }}
        maxSize={MAX_FILE}
        radius="md"
        p="md"
        styles={(t) => ({
          root: {
            border: `2px dashed ${t.colors.gray[4]}`,
            cursor: "pointer",
          },
        })}
      >
        {croppedURL ? (
          <Preview
            avatar={croppedURL}
            onClear={clear}
            onUpload={upload}
            uploading={uploading}
          />
        ) : (
          <Prompt />
        )}
      </Dropzone>

      <CropModal
        opened={open}
        onClose={() => setOpen(false)}
        img={rawURL}
        crop={crop}
        setCrop={setCrop}
        circle={circle}
        setCircle={setCircle}
        onCropComplete={onCropComplete}
        onConfirm={confirmCrop}
        containerSide={CONTAINER}
        min={MIN_CIRCLE}
        max={MAX_CIRCLE}
        isMobile={isMobile}
      />
    </Box>
  );
}

const Prompt = () => (
  <Group direction="column" gap="xs" py="xl" align="center">
    <IconUpload size={40} />
    <Text size="sm" c="dimmed">
      Drag an image or click to select
    </Text>
  </Group>
);

const Preview = ({ avatar, onClear, onUpload, uploading }) => (
  <Group direction="column" gap="xs" align="center">
    <MantineImage src={avatar} w={150} h={150} radius="50%" fit="cover" />
    <Group gap="xs">
      <ActionIcon
        size="lg"
        color="red"
        variant="filled"
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        disabled={uploading}
      >
        <IconX size={18} />
      </ActionIcon>
      <ActionIcon
        size="lg"
        color="blue"
        variant="filled"
        onClick={(e) => {
          e.stopPropagation();
          onUpload();
        }}
        disabled={uploading}
      >
        {uploading ? <Loader size={18} /> : <IconUpload size={18} />}
      </ActionIcon>
    </Group>
  </Group>
);

const CropModal = ({
  opened,
  onClose,
  img,
  crop,
  setCrop,
  circle,
  setCircle,
  onCropComplete,
  onConfirm,
  containerSide,
  min,
  max,
  isMobile,
}) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={<div style={{ width: '100%', textAlign: 'center' }}>Adjust your avatar</div>}
    centered
    size={isMobile ? 'auto' : 'lg'}
    fullScreen={isMobile}
    styles={{
      content: isMobile
        ? {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            margin: 0,
            borderRadius: 0,
            padding: 0,
          }
        : {},
      body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : undefined,
        width: isMobile ? '100vw' : undefined,
        minHeight: isMobile ? '100vh' : undefined,
        height: isMobile ? '100vh' : undefined,
      },
    }}
  >
    {img && (
      <>
        <Box
          pos="relative"
          mx="auto"
          style={{
            width: isMobile ? '90vw' : containerSide,
            height: isMobile ? '90vw' : containerSide,
            maxWidth: '90vw',
            maxHeight: '90vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: isMobile ? '0 auto' : undefined,
            marginTop: isMobile ? 16 : undefined,
          }}
        >
          <Cropper
            image={img}
            crop={crop}
            zoom={1}
            zoomWithScroll={false}
            aspect={1}
            cropShape="round"
            showGrid={false}
            cropSize={{ width: circle, height: circle }}
            restrictPosition
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
          />
        </Box>
        <Group mt={isMobile ? 24 : 'sm'} align="center" gap={isMobile ? 'md' : 'xs'} justify="center" style={isMobile ? { width: '100%' } : {}}>
          <ActionIcon onClick={() => setCircle((v) => Math.max(min, v - 20))} size={isMobile ? 'xl' : 'lg'}>
            <IconCircleMinus size={isMobile ? 28 : 18} />
          </ActionIcon>
          <Slider
            value={circle}
            onChange={setCircle}
            min={min}
            max={max}
            style={{ flex: 1, maxWidth: isMobile ? 180 : 250 }}
            label={null}
            size={isMobile ? 'md' : 'sm'}
          />
          <ActionIcon onClick={() => setCircle((v) => Math.min(max, v + 20))} size={isMobile ? 'xl' : 'lg'}>
            <IconCirclePlus size={isMobile ? 28 : 18} />
          </ActionIcon>
        </Group>
        <Group
          justify="center"
          mt={isMobile ? 24 : 'md'}
          style={isMobile ? { width: '100%', flexDirection: 'column', gap: 16, alignItems: 'center' } : {}}
        >

          <Button
            onClick={onConfirm}
            leftSection={<IconCrop size={isMobile ? 20 : 14} />}
            size={isMobile ? 'lg' : 'md'}
            style={isMobile ? { minWidth: '90vw', maxWidth: 400 } : {}}
            fullWidth={isMobile}
          >
            Set Avatar
          </Button>

          <Button
            variant="default"
            onClick={onClose}
            leftSection={<IconX size={isMobile ? 20 : 14} />}
            size={isMobile ? 'lg' : 'md'}
            style={isMobile ? { minWidth: '90vw', maxWidth: 400 } : {}}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
        </Group>
      </>
    )}
  </Modal>
);

async function buildAvatar(src, area, side) {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(side / 2, side / 2, side / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    side,
    side
  );
  return new Promise((res) => canvas.toBlob(res, "image/webp", 0.8));
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

import { Share as ShareIcon } from "../components/icons/Share.tsx";

interface Props {
  onClick: () => Promise<File>;
  disabled: boolean;
}

export function ShareButton(props: Props) {
  const handleClick = async () => {
    const imageFile = await props.onClick();
    try {
      await navigator.share({
        files: [imageFile],
      });
    } catch (error) {
      console.error(error);
    }
  };

  if(!navigator.canShare) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      class="btn btn-primary btn-sm rounded md:w-fit"
      disabled={props.disabled}
      aria-disabled={props.disabled}
    >
      <ShareIcon />
      Share
    </button>
  );
}

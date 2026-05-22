interface UserAvatarProps {
  avatarId?: number | null;
  size?: number;
  className?: string;
  alt?: string;
}

export default function UserAvatar({
  avatarId,
  size = 32,
  className = "",
  alt = "Avatar",
}: UserAvatarProps) {
  const id = avatarId && avatarId >= 1 && avatarId <= 21 ? avatarId : 1;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/${id}.png`}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-lg shrink-0 ${className}`}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

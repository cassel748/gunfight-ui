import Image from 'next/image'
import useSettings from '../../hooks/useSettings';

export default function LogoText({ width = 200, height = 68 }) {
  const { themeMode } = useSettings();
  
  const logoImage = themeMode === 'light' ? '' : '_white';

  return (
    <Image src={`/static/brand/logo_gunfight${logoImage}.png`} alt="LOGO GUNFIGHT" width={width} height={height} priority={false} />
  )
}

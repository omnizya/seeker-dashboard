import Image from 'next/image';
import LoaderStyle from './loader.module.css'
const Loader = () => (
<div className={LoaderStyle.container}>
    <Image 
      src={'/basmallah.svg'}
      alt='basmalla'
      width={320}
      height={200}
      className='w-screen/2 dark:invert'
    />
    <div className={LoaderStyle.loader}></div>
  </div>
)

export default Loader;

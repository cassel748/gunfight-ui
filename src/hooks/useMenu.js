import { useContext } from 'react';
import { MenuContext } from 'src/contexts/MenuContext';

// ----------------------------------------------------------------------

const useMenu = () => useContext(MenuContext);

export default useMenu;

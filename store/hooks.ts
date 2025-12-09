import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Hooks typés pour Redux
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

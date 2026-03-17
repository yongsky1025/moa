import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../users/reducers/authSlice';
import type { RootState, AppDispatch } from '../../users/reducers/store';

export const useBoardPageLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const onToggleLogin = useCallback(() => {
    if (isLoggedIn) {
      void dispatch(logout());
      return;
    }
    navigate('/');
  }, [dispatch, isLoggedIn, navigate]);

  return {
    isLoggedIn,
    onToggleLogin,
    isAdmin: false,
  };
};


import { get } from 'svelte/store';
import { auth } from './index';
import * as api from './functions';
import { isInitializing, isLoggingIn, isRegistering, user } from '../stores/auth';
import User from '@/models/User';

export const login = (email, password) => {
  isLoggingIn.set(true);
  return auth.signInWithEmailAndPassword(email, password).then(() => {
    isLoggingIn.set(false);
  });
};

export const register = async ({ email, password, firstName, lastName, countryCode }) => {
  isRegistering.set(true);
  await auth.createUserWithEmailAndPassword(email, password);
  await api.createUser({ firstName, lastName, countryCode });
  await auth.currentUser.reload();
  user.set(new User(auth.currentUser));
  isRegistering.set(false);
};

export const logout = () => auth.signOut();

export const requestPasswordReset = (email) => api.requestPasswordReset(email);

export const createAuthObserver = () =>
  auth.onAuthStateChanged((userData) => {
    isInitializing.set(false);
    if (!userData) user.set(null);
    else user.set(new User(userData));
  });

export const resendAccountVerification = () => {
  if (!get(user) || get(user).emailVerified) return;
  return api.resendAccountVerification();
};
export const verifyPasswordResetCode = (code) => auth.verifyPasswordResetCode(code);
export const applyActionCode = async (code) => {
  await auth.applyActionCode(code);
  await auth.currentUser.reload();
  user.set(new User(auth.currentUser));
};
export const confirmPasswordReset = (code, password) => auth.confirmPasswordReset(code, password);

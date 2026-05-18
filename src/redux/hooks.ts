"use client";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";

/**
 * Typed dispatch hook — use instead of plain `useDispatch`.
 * Ensures dispatched actions are type-checked against AppDispatch.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Typed selector hook — use instead of plain `useSelector`.
 * Ensures selected state is type-checked against RootState.
 */
export const useAppSelector = useSelector.withTypes<RootState>();

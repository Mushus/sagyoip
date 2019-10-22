import { useCallback, useState } from 'react';

export const useAsyncFnToggle = (
  on: () => Promise<any> | any,
  off: () => Promise<any> | any,
  deps: readonly any[],
): [boolean, boolean, () => Promise<void>] => {
  const [isOn, setOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const handler = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isOn) {
        await off();
      } else {
        await on();
      }
    } catch (e) {
      console.error(e);
    }

    setOn(!isOn);
    setLoading(false);
  }, [isOn, loading, ...deps]);
  return [loading, isOn, handler];
};

export const useDialog = (): [() => void, { open: boolean; onClose: () => void }] => {
  const [open, setOpen] = useState(false);

  const openFunc = useCallback(() => {
    setOpen(true);
  }, []);
  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const dialogProps = { open, onClose };
  return [openFunc, dialogProps];
};

import React, { forwardRef, useState } from 'react';

export const secretFieldProps = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'none',
  spellCheck: false,
  'data-lpignore': 'true',
  'data-1p-ignore': 'true',
  'data-form-type': 'other',
};

const armField = (node) => {
  if (node && node.readOnly) node.readOnly = false;
};

const SecretInput = forwardRef(({ className, onFocus, onPointerDown, name = 'fv-secret', ...props }, ref) => {
  const [armed, setArmed] = useState(false);

  const setRef = (node) => {
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <input
      {...secretFieldProps}
      {...props}
      ref={setRef}
      name={name}
      readOnly={!armed}
      onPointerDown={(event) => {
        setArmed(true);
        armField(event.currentTarget);
        onPointerDown?.(event);
      }}
      onFocus={(event) => {
        setArmed(true);
        armField(event.currentTarget);
        onFocus?.(event);
      }}
      className={className}
    />
  );
});

SecretInput.displayName = 'SecretInput';

export default SecretInput;

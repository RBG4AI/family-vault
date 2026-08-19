import React, { useState } from 'react';

export const secretFieldProps = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'none',
  spellCheck: false,
  'data-lpignore': 'true',
  'data-1p-ignore': 'true',
  'data-form-type': 'other',
};

const SecretInput = ({ className, onFocus, name = 'fv-secret', ...props }) => {
  const [armed, setArmed] = useState(false);

  return (
    <input
      {...secretFieldProps}
      {...props}
      name={name}
      readOnly={!armed}
      onFocus={(event) => {
        setArmed(true);
        onFocus?.(event);
      }}
      className={className}
    />
  );
};

export default SecretInput;

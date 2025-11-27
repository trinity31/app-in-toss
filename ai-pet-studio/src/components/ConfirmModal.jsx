import { colors } from '@toss/tds-colors';

export default function ConfirmModal({ open, onClose, title, description, confirmButton, cancelButton }) {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.content}>
          <h3 style={styles.title}>{title}</h3>
          <p style={styles.description}>
            {description.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>
        <div style={styles.buttonGroup}>
          <button style={styles.cancelButton} onClick={cancelButton.onClick}>
            {cancelButton.text}
          </button>
          <div style={styles.divider} />
          <button style={styles.confirmButton} onClick={confirmButton.onClick}>
            {confirmButton.text}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '40px',
  },
  container: {
    width: '100%',
    maxWidth: '300px',
    backgroundColor: colors.white,
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
  },
  content: {
    padding: '24px 24px 20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: colors.grey900,
    margin: '0 0 8px 0',
    lineHeight: 1.4,
  },
  description: {
    fontSize: '14px',
    fontWeight: 400,
    color: colors.grey700,
    margin: 0,
    lineHeight: 1.5,
  },
  buttonGroup: {
    display: 'flex',
    borderTop: `1px solid ${colors.grey200}`,
    height: '52px',
  },
  cancelButton: {
    flex: 1,
    border: 'none',
    backgroundColor: colors.white,
    color: colors.grey600,
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: 0,
  },
  confirmButton: {
    flex: 1,
    border: 'none',
    backgroundColor: colors.white,
    color: colors.blue500,
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
  divider: {
    width: '1px',
    backgroundColor: colors.grey200,
  },
};

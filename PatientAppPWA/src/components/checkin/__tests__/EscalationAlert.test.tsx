import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EscalationAlert from '../EscalationAlert';

vi.mock('../../../utils/haptics', () => ({ haptic: vi.fn() }));
afterEach(cleanup);

describe('escalation persistence feedback', () => {
  it('keeps emergency calling available while saving', () => {
    render(<EscalationAlert hospitalName="Test Hospital" status="pending" onDismiss={vi.fn()} onRetry={vi.fn()} />);
    expect(screen.getByRole('link', { name: /Call 911/ })).toHaveAttribute('href', 'tel:911');
    expect(screen.getByText(/Saving your urgent concern/)).toBeInTheDocument();
    expect(screen.queryByText(/care team notified/)).not.toBeInTheDocument();
  });

  it('offers a retry and direct-contact guidance when saving fails', () => {
    const retry = vi.fn();
    render(<EscalationAlert hospitalName="Test Hospital" status="failed" onDismiss={vi.fn()} onRetry={retry} />);
    expect(screen.getByText(/Unable to save your concern/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try saving again' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('describes a saved concern without claiming notification delivery', () => {
    render(<EscalationAlert hospitalName="Test Hospital" status="saved" onDismiss={vi.fn()} onRetry={vi.fn()} />);
    expect(screen.getByText('Urgent concern saved for your Test Hospital care team')).toBeInTheDocument();
    expect(screen.queryByText(/notified/)).not.toBeInTheDocument();
  });
});

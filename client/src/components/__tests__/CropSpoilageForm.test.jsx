// client/src/components/__tests__/CropSpoilageForm.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CropSpoilageForm from '../CropSpoilageForm';

describe('CropSpoilageForm', () => {
  it('renders all required input fields', () => {
    render(
      <MemoryRouter>
        <CropSpoilageForm />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Crop Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Warehouse Size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Manufacture Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expiry Date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Summary/i })).toBeInTheDocument();
  });
});

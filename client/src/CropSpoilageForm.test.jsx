// Example wrapper for context
import { AuthContext } from 'path-to-context/AuthContext';

const mockUser = { id: 'test-user', name: 'Test User' };

render(
  <AuthContext.Provider value={{ user: mockUser }}>
    <CropSpoilageForm />
  </AuthContext.Provider>
);

/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import mockStore from '../__mocks__/store.js';
import router from '../app/Router.js';
import { ROUTES_PATH } from '../constants/routes';
import { localStorageMock } from '../__mocks__/localStorage';
import BillsUI from '../views/BillsUI.js';
import NewBillUI from '../views/NewBillUI';
import NewBill from '../containers/NewBill';

jest.mock('../app/store.js', () => mockStore)

describe('Given I am a user connected as Employee', () => {
    describe('When I am on NewBill Page', () => {
        localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.NewBill);

        const newBill = new NewBill({
            document,
            onNavigate,
            store: mockStore,
            localStorage,
        });

        test('Then I should be able to upload a file', () => {
            jest.spyOn(window, 'alert').mockImplementation(() => {});
            const handleChangeFile = jest.fn(newBill.handleChangeFile);
            const file = new File(['hello'], 'hello.png', { type: 'image/png' });
            const input = screen.getByTestId('file');
            input.addEventListener('change', handleChangeFile);
            userEvent.upload(screen.getByTestId('file'), file);
            expect(handleChangeFile).toHaveBeenCalled();
            expect(window.alert).not.toHaveBeenCalledWith('Merci de transmetre un justificatif étant au format .jpg, .jpeg ou png');
        });

        test('Then I should be not able to upload a file without jpg jpeg or png extension', async () => {
            jest.spyOn(window, 'alert').mockImplementation(() => {});
            const handleChangeFile = jest.fn(newBill.handleChangeFile);
            const file = new File(['hello'], 'hello.zip', { type: 'image/zip' });
            const input = screen.getByTestId('file');
            input.addEventListener('change', handleChangeFile);
            userEvent.upload(screen.getByTestId('file'), file);
            expect(window.alert).toHaveBeenCalledWith('Merci de transmetre un justificatif étant au format .jpg, .jpeg ou png');
        });

        // test handleSubmit
        test('Then I should be able to submit a new bill', async () => {
            const handleSubmit = jest.fn(newBill.handleSubmit);
            const form = screen.getByTestId('form-new-bill');
            form.addEventListener('submit', handleSubmit);
            fireEvent.submit(form);
            expect(handleSubmit).toHaveBeenCalled();
        });
    });
});

// // Test d'intégration POST
describe('Given I am connected as an employee', () => {
  describe('When I add a new bill', () => {
    test('fetches bills from mock API POST', async () => {
      jest.spyOn(mockStore.bills(), 'update')
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })
      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('click', handleSubmit)
      userEvent.click(form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(form).toBeTruthy()
    })
  })
  test('Then it fails with a 404 message error', async () => {
    const html = BillsUI({ error: 'Erreur 404' })
    document.body.innerHTML = html
    const message = screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })
  test('Then it fails with a 500 message error', async () => {
    const html = BillsUI({ error: 'Erreur 500' })
    document.body.innerHTML = html
    const message = screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })
})
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

// test d'intégration POST

describe("Given I am a user connected as Employee", () => {
    beforeEach(() => {
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
  
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "ryan@mail"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
  
    describe("When I navigate to NewBill page", () => {
      test("Then create new bill to mock API POST", async () => {
        document.body.innerHTML = NewBillUI()
        const spy = jest.spyOn(mockStore, "bills")
        const billdata={
          status: "pending",
          pct: 20,
          amount: 200,
          email: "ryan@mail",
          name: "holidays",
          vat: "40",
          fileName: "justificatif.jpg",
          date: "2002-02-02",
          commentary: "holidays",
          type: "Restaurants et bars",
          fileUrl: "justificatif.jpg"
        }
        mockStore.bills().create(billdata)
        expect(spy).toHaveBeenCalledTimes(1)
        expect(billdata.fileUrl).toBe("justificatif.jpg")
      })
    })
  
    describe("When an error occurs on API", () => {
      test("Then it fails with 404 message error", async () => {      
        jest.spyOn(mockStore, "bills")
        const rejected = mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {return Promise.reject(new Error("Erreur 404"))}
          }
        })
  
        window.onNavigate(ROUTES_PATH.NewBill)
        await new Promise(process.nextTick);
        expect(rejected().create).rejects.toEqual(new Error("Erreur 404"))
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      })
      
      test("Then create new bill to an API and fails with 500 message error", async () => {
        jest.spyOn(mockStore, "bills")
        const rejected = mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {return Promise.reject(new Error("Erreur 500"))}
          }
        })
  
        window.onNavigate(ROUTES_PATH.NewBill)
        await new Promise(process.nextTick);
  
        expect(rejected().create).rejects.toEqual(new Error("Erreur 500"))
      })
    })
  })




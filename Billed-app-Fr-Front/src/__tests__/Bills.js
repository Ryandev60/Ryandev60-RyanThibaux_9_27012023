/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import mockStore from '../__mocks__/store';
import { localStorageMock } from '../__mocks__/localStorage.js';
import Bills from '../containers/Bills.js';
import userEvent from '@testing-library/user-event';
import router from '../app/Router.js';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
    describe('When I am on Bills Page', () => {
        test('Then bill icon in vertical layout should be highlighted', async () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock });
            window.localStorage.setItem(
                'user',
                JSON.stringify({
                    type: 'Employee',
                })
            );
            const root = document.createElement('div');
            root.setAttribute('id', 'root');
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId('icon-window'));
            const windowIcon = screen.getByTestId('icon-window');
            //to-do write expect expression
            expect(windowIcon.className).toBe('active-icon');
        });
        test('Then bills should be ordered from earliest to latest', () => {
            document.body.innerHTML = BillsUI({
                data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)),
            });
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });
});

describe('When i click on the eye icon', () => {
    test('A modal should open', async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem(
            'user',
            JSON.stringify({
                type: 'Employee',
            })
        );
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        $.fn.modal = jest.fn();

        const bill = new Bills({
            document,
            onNavigate,
            localStorage: window.localStorage,
        });

        const iconEye = screen.getAllByTestId('icon-eye');
        const handleClickIconEye = jest.fn(() => bill.handleClickIconEye);
        iconEye[0].addEventListener('click', handleClickIconEye);
        userEvent.click(iconEye[0]);
        expect(handleClickIconEye).toHaveBeenCalled();

        const modale = document.getElementById('modaleFile');
        expect(modale).toBeTruthy();
    });
});

//test for handleClickNewBill
describe('When i click on the new bill button', () => {
    test('Then it should redirect to the new bill page', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem(
            'user',
            JSON.stringify({
                type: 'Employee',
            })
        );
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        const bill = new Bills({
            document,
            onNavigate,
            localStorage: window.localStorage,
        });
        const handleClickNewBill = jest.fn(() => bill.handleClickNewBill);
        const buttonNewBill = screen.getByTestId('btn-new-bill');
        buttonNewBill.addEventListener('click', handleClickNewBill);
        userEvent.click(buttonNewBill);
        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
    });
});

// test d'intégration GET
describe('Given I am a user connected as Employee', () => {
    describe('When I navigate to Bills', () => {
        test('fetches bills from mock API GET', async () => {
            localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
            const root = document.createElement('div');
            root.setAttribute('id', 'root');
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            expect(document.querySelector('tbody').rows.length).toBeGreaterThan(0);
        });
        describe('When an error occurs on API', () => {
            beforeEach(() => {
                jest.spyOn(mockStore, 'bills');
                Object.defineProperty(window, 'localStorage', { value: localStorageMock });
                window.localStorage.setItem(
                    'user',
                    JSON.stringify({
                        type: 'Employee',
                        email: 'a@a',
                    })
                );
                const root = document.createElement('div');
                root.setAttribute('id', 'root');
                document.body.appendChild(root);
                router();
            });
            test('fetches bills from an API and fails with 404 message error', async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error('Erreur 404'));
                        },
                    };
                });
                window.onNavigate(ROUTES_PATH.Bills);
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 404/);
                expect(message).toBeTruthy();
            });
            test('fetches messages from an API and fails with 500 message error', async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error('Erreur 500'));
                        },
                    };
                });
                window.onNavigate(ROUTES_PATH.Bills);
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 500/);
                expect(message).toBeTruthy();
            });
        });
    });
});

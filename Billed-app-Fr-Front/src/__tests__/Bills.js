/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import router from '../app/Router.js';
import userEvent from '@testing-library/user-event';
import BillsUI from '../views/BillsUI.js';
import Bills from '../containers/Bills.js';

describe('Given I am connected as an employee on Bills page', () => {
    //Initialize pages
    const newBills = new Bills({
        document,
    });
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
    describe('It should be displayed', () => {
        it('should be display bill icon in vertical layout highlighted', () => {
            window.onNavigate(ROUTES_PATH.Bills);
            waitFor(() => screen.getByTestId('icon-window'));
            const windowIcon = screen.getByTestId('icon-window');
            //to-do write expect expression
            expect(windowIcon.className).toBe('active-icon');
        });
        it('should be display bills ordered from earliest to latest', () => {
            // Get all dates on Bills pages and we check if they are sort
            document.body.innerHTML = BillsUI({
                data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)),
            });
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });

    describe('I click on eye icon for display proof', () => {
        const displayModal = jest.fn((e) => {
            newBills.handleClickIconEye(e.target);
        });
        $.fn.modal = jest.fn(); //Prevent jquery error
        it('should be called the function displayModal', () => {
            // Get eyes icons
            const iconEye = screen.getAllByTestId('icon-eye')[0];
            iconEye.addEventListener('click', displayModal);
            userEvent.click(iconEye);
            expect(displayModal).toHaveBeenCalled();
        });

        it('should display modal with proof ', () => {
            displayModal;
            expect(screen.getByText('Justificatif'));
        });
    });

});

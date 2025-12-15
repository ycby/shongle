import { describe, expect, test } from "@jest/globals";
import { validator } from "#root/src/utilities/Validator.ts";
describe('Validator tests', () => {
    test('Check validator validates single datum normally', () => {
        const data = {
            name: 'Test1',
            email: 'test@test.com',
            age: 23
        };
        const validationRules = [
            {
                name: 'name',
                isRequired: false,
                rule: (name) => typeof name === 'string',
                errorMessage: 'Name must be a string'
            },
            {
                name: 'email',
                isRequired: false,
                rule: (email) => typeof email === 'string' && email.indexOf('@') !== -1,
                errorMessage: 'Email must be a string and must have an @'
            },
            {
                name: 'age',
                isRequired: false,
                rule: (age) => typeof age === 'number',
                errorMessage: 'Age must be a number'
            }
        ];
        let validationResults = validator(data, validationRules);
        expect(validationResults.length).toBe(0);
    });
    test('Check validator validates data normally', () => {
        const data = [
            {
                name: 'Test1',
                email: 'test@test.com',
                age: 23
            },
            {
                name: 'Test2',
                email: 'test2@test.com',
                age: 25
            }
        ];
        const validationRules = [
            {
                name: 'name',
                isRequired: false,
                rule: (name) => typeof name === 'string',
                errorMessage: 'Name must be a string'
            },
            {
                name: 'email',
                isRequired: false,
                rule: (email) => typeof email === 'string' && email.indexOf('@') !== -1,
                errorMessage: 'Email must be a string and must have an @'
            },
            {
                name: 'age',
                isRequired: false,
                rule: (age) => typeof age === 'number',
                errorMessage: 'Age must be a number'
            }
        ];
        let validationResults = validator(data, validationRules);
        expect(validationResults.length).toBe(0);
    });
    test('Check validator validates single datum all fields missing', () => {
        const data = {};
        const validationRules = [
            {
                name: 'name',
                isRequired: false,
                rule: (name) => typeof name === 'string',
                errorMessage: 'Name must be a string'
            },
            {
                name: 'email',
                isRequired: false,
                rule: (email) => typeof email === 'string' && email.indexOf('@') !== -1,
                errorMessage: 'Email must be a string and must have an @'
            },
            {
                name: 'age',
                isRequired: false,
                rule: (age) => typeof age === 'number',
                errorMessage: 'Age must be a number'
            }
        ];
        let validationResults = validator(data, validationRules);
        expect(validationResults.length).toBe(0);
    });
    test('Check validator validates single datum required field', () => {
        const data = {};
        const validationRules = [
            {
                name: 'name',
                isRequired: true,
                rule: (name) => typeof name === 'string',
                errorMessage: 'Name must be a string'
            },
            {
                name: 'email',
                isRequired: false,
                rule: (email) => typeof email === 'string' && email.indexOf('@') !== -1,
                errorMessage: 'Email must be a string and must have an @'
            },
            {
                name: 'age',
                isRequired: false,
                rule: (age) => typeof age === 'number',
                errorMessage: 'Age must be a number'
            }
        ];
        let validationResults = validator(data, validationRules);
        expect(validationResults.length).toBe(1);
        expect(validationResults[0].index).toBe(0);
        expect(validationResults[0].errorMessages).toStrictEqual(['Field "name" is required.']);
    });
    test('Check validator validates single datum failing requirement', () => {
        const data = {
            name: 99,
            email: 'test@test.com',
            age: 23
        };
        const validationRules = [
            {
                name: 'name',
                isRequired: true,
                rule: (name) => typeof name === 'string',
                errorMessage: 'Name must be a string'
            },
            {
                name: 'email',
                isRequired: false,
                rule: (email) => typeof email === 'string' && email.indexOf('@') !== -1,
                errorMessage: 'Email must be a string and must have an @'
            },
            {
                name: 'age',
                isRequired: false,
                rule: (age) => typeof age === 'number',
                errorMessage: 'Age must be a number'
            }
        ];
        let validationResults = validator(data, validationRules);
        expect(validationResults.length).toBe(1);
        expect(validationResults[0].index).toBe(0);
        expect(validationResults[0].errorMessages).toStrictEqual(['Field "name": Name must be a string']);
    });
});

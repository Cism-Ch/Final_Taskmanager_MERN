import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Définir les catégories de base selon le modèle de tâche
export const DEFAULT_CATEGORIES = ['Personal', 'Work', 'Shopping', 'Travel', 'School', 'Home', 'Other'];

const URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('token');

// Action asynchrone pour récupérer les catégories à partir des tâches de l'utilisateur
export const fetchUserCategories = createAsyncThunk(
    'categories/fetchUserCategories',
    async () => {
        const { data } = await axios.get(`${URL}/auth/users/tasks`, {
            headers: { Authorization: getToken() }
        });
        // Extraire les catégories uniques des tâches
        const categories = new Set(data.data.map(task => task.category));
        return Array.from(categories);
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState: {
        availableCategories: DEFAULT_CATEGORIES,
        currentCategory: 'All',
        loading: false,
        error: null
    },
    reducers: {
        setCurrentCategory: (state, action) => {
            state.currentCategory = action.payload;
        },
        updateAvailableCategories: (state, action) => {
            const categories = new Set([...action.payload, ...DEFAULT_CATEGORIES]);
            state.availableCategories = Array.from(categories);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.availableCategories = Array.from(new Set([...action.payload, ...DEFAULT_CATEGORIES]));
            })
            .addCase(fetchUserCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase('auth/logout', (state) => {
                state.availableCategories = DEFAULT_CATEGORIES;
                state.currentCategory = 'All';
                state.loading = false;
                state.error = null;
            });
    }
});

export const { setCurrentCategory, updateAvailableCategories } = categorySlice.actions;

// Sélecteurs
export const selectAvailableCategories = state => state.categories.availableCategories;
export const selectCurrentCategory = state => state.categories.currentCategory;
export const selectCategoryLoading = state => state.categories.loading;
export const selectCategoryError = state => state.categories.error;

export default categorySlice.reducer;
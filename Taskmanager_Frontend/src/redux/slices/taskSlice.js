import {
	createSlice,
	createAsyncThunk,
	createSelector,
} from "@reduxjs/toolkit";
import axios from "axios";

// Sélecteur de base pour les tâches (mémorisé)
const selectTasks = (state) => state?.tasks?.tasks || [];

const URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

const initialState = {
	tasks: [],
	filter: "All",
	statusFilter: "All",
	sortOrder: "none", // 'none' | 'asc' | 'desc'
	sortType: "none", // 'none' | 'alpha' | 'date'
	status: "idle", //'idle' | 'loading' | 'success' | 'failed'
	error: null,
	sortLoading: false,
	sortError: null,
	pagination: {
		page: 1,
		limit: 20,
		total: 0,
		pages: 0
	}
};

export const getOwnerTasks = createAsyncThunk(
	"task/getOwnerTasks",
	async (ownerid) => {
		const { data } = await axios.get(`${URL}/tasks/owner/${ownerid}`, {
			headers: { Authorization: getToken() },
		});
		return data;
	}
);

export const getTasks = createAsyncThunk("task/getTasks", async () => {
	const { data } = await axios.get(`${URL}/tasks`, {
		headers: { Authorization: getToken() },
	});
	return data;
});

export const postTask = createAsyncThunk("task/postTask", async (payload) => {
	const { data } = await axios.post(`${URL}/tasks/create`, payload, {
		headers: { Authorization: getToken() },
	});
	return data;
});

export const putTask = createAsyncThunk("task/putTask", async (payload) => {
	const { data } = await axios.put(
		`${URL}/tasks/update/${payload._id}`,
		payload,
		{ headers: { Authorization: getToken() } }
	);
	return data;
});

export const deleteTask = createAsyncThunk("task/deleteTask", async (id) => {
	const { data } = await axios.delete(`${URL}/tasks/delete/${id}`, {
		headers: { Authorization: getToken() },
	});
	return data;
});

export const deleteManyTask = createAsyncThunk(
	"task/deleteManyTask",
	async (payload) => {
		const { data } = await axios.post(`${URL}/tasks/delete-many`, payload, {
			headers: { Authorization: getToken() },
		});
		return data;
	}
);

export const getTasksSortedByTitle = createAsyncThunk(
	'task/getTasksSortedByTitle',
	async ({ ownerId, order, page = 1 }) => {
		const { data } = await axios.get(
			`${URL}/tasks/owner/${ownerId}/sort/title/${order}`,
			{
				params: { page },
				headers: { Authorization: getToken() }
			}
		);
		return data;
	}
);

export const getTasksSortedByDate = createAsyncThunk(
	'task/getTasksSortedByDate',
	async ({ ownerId, order, page = 1 }) => {
		const { data } = await axios.get(
			`${URL}/tasks/owner/${ownerId}/sort/date/${order}`,
			{
				params: { page },
				headers: { Authorization: getToken() }
			}
		);
		return data;
	}
);

export const getTasksByStatus = createAsyncThunk(
	"task/getTasksByStatus",
	async ({ ownerId, status }) => {
		const { data } = await axios.get(
			`${URL}/tasks/owner/${ownerId}/status/${status}`,
			{ headers: { Authorization: getToken() } }
		);
		return data;
	}
);

export const fetchImportantTasks = createAsyncThunk(
	"task/fetchImportantTasks",
	async ({ ownerId }) => {
		const { data } = await axios.get(`${URL}/tasks/owner/${ownerId}/important`, {
			headers: { Authorization: getToken() },
		});
		return data;
	}
);

export const getTasksByDueDate = createAsyncThunk(
	"task/getTasksByDueDate",
	async ({ ownerId, startDate, endDate }) => {
		const { data } = await axios.get(
			`${URL}/tasks/owner/${ownerId}/due-date`,
			{
				params: { startDate, endDate },
				headers: { Authorization: getToken() },
			}
		);
		return data;
	}
);

export const toggleTaskImportance = createAsyncThunk(
	"task/toggleTaskImportance",
	async (taskId) => {
		const { data } = await axios.put(
			`${URL}/tasks/${taskId}/important`,
			{},
			{ headers: { Authorization: getToken() } }
		);
		return data;
	}
);

const taskSlice = createSlice({
	name: "tasks",
	initialState,
	reducers: {
		changeFilter: (state, action) => {
			state.filter = action.payload;
		},
		changeStatusFilter: (state, action) => {
			state.statusFilter = action.payload;
		},
		changeSortOrder: (state, action) => {
			state.sortOrder = action.payload;
		},
		changeSortType: (state, action) => {
			state.sortType = action.payload;
		},
		resetFilters: (state) => {
			state.filter = "All";
			state.statusFilter = "All";
			state.sortOrder = "none";
			state.sortType = "none";
		}
	},
	extraReducers(builder) {
		builder
			.addCase(getTasks.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getTasks.fulfilled, (state, action) => {
				state.status = "success";
				state.tasks = [...action.payload];
			})
			.addCase(getTasks.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})

			.addCase(getOwnerTasks.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getOwnerTasks.fulfilled, (state, action) => {
				state.status = "success";
				state.tasks = [...action.payload];
			})
			.addCase(getOwnerTasks.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})

			.addCase(deleteManyTask.pending, (state) => {
				state.status = "loading";
			})
			.addCase(deleteManyTask.fulfilled, (state, action) => {
				const { deletedCount, ids } = action.payload;
				state.status = "success";
				if (deletedCount > 0) {
					state.tasks = state.tasks.filter(
						(value) => ids.indexOf(value._id) == -1
					);
				}
			})
			.addCase(deleteManyTask.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})

			.addCase(postTask.pending, (state) => {
				state.status = "loading";
				state.error = "";
			})
			.addCase(postTask.fulfilled, (state, action) => {
				state.status = "success";
				state.tasks.push(action.payload);
				state.error = "";
			})
			.addCase(postTask.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})

			.addCase(putTask.pending, (state) => {
				state.status = "loading";
				state.error = "";
			})
			.addCase(putTask.fulfilled, (state, action) => {
				state.status = "success";
				state.tasks = state.tasks.map((todo) =>
					todo._id === action.payload._id ? action.payload : todo
				);
				state.error = "";
			})
			.addCase(putTask.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})

			.addCase(deleteTask.pending, (state) => {
				state.status = "loading";
				state.error = "";
			})
			.addCase(deleteTask.fulfilled, (state, action) => {
				state.status = "success";
				if (action.payload && action.payload._id) {
					state.tasks = state.tasks.map((task) => {
						if (task._id === action.payload._id) {
							return {
								...task,
								status: "deleted",
								isDeleted: true,
							};
						}
						return task;
					});
				} else {
					state.error = "Erreur: ID de tâche invalide";
					state.status = "failed";
					return;
				}
				state.error = "";
			})
			.addCase(deleteTask.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})

			.addCase(getTasksByStatus.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getTasksByStatus.fulfilled, (state, action) => {
				state.status = "success";
				state.tasks = action.payload;
			})
			.addCase(getTasksByStatus.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})

			.addCase(getTasksByDueDate.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getTasksByDueDate.fulfilled, (state, action) => {
				state.status = "success";
				state.tasks = action.payload;
			})
			.addCase(getTasksByDueDate.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})

			.addCase(toggleTaskImportance.pending, (state) => {
				state.status = "loading";
			})
			.addCase(toggleTaskImportance.fulfilled, (state, action) => {
				state.status = "success";
				state.tasks = state.tasks.map((task) =>
					task._id === action.payload._id ? action.payload : task
				);
			})
			.addCase(toggleTaskImportance.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})

			.addCase(getTasksSortedByTitle.pending, (state) => {
				state.sortLoading = true;
				state.sortError = null;
			})
			.addCase(getTasksSortedByTitle.fulfilled, (state, action) => {
				state.sortLoading = false;
				state.tasks = action.payload.tasks;
				state.pagination = action.payload.pagination;
				state.sortError = null;
			})
			.addCase(getTasksSortedByTitle.rejected, (state, action) => {
				state.sortLoading = false;
				state.sortError = action.error.message;
			})

			.addCase(getTasksSortedByDate.pending, (state) => {
				state.sortLoading = true;
				state.sortError = null;
			})
			.addCase(getTasksSortedByDate.fulfilled, (state, action) => {
				state.sortLoading = false;
				state.tasks = action.payload.tasks;
				state.pagination = action.payload.pagination;
				state.sortError = null;
			})
			.addCase(getTasksSortedByDate.rejected, (state, action) => {
				state.sortLoading = false;
				state.sortError = action.error.message;
			})

			// Gestion des tâches importantes
			.addCase(fetchImportantTasks.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchImportantTasks.fulfilled, (state, action) => {
				state.status = "success";
				state.tasks = action.payload;
			})
			.addCase(fetchImportantTasks.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})

			.addCase("auth/logout", (state) => {
				state.tasks = [];
				state.status = "idle";
				state.error = null;
				state.filter = "All";
				state.statusFilter = "All";
			});
	},
});

// Sélecteurs simples
export const selectAllTasks = selectTasks;
export const getTaskStatus = (state) => state.tasks.status;
export const getTaskError = (state) => state.tasks.error;
export const getFilter = (state) => state.tasks.filter;
export const getStatusFilter = (state) => state.tasks.statusFilter;
export const getSortOrder = (state) => state.tasks.sortOrder;
export const getSortType = (state) => state.tasks.sortType;

/**
 * @description Sélecteurs mémorisés pour la gestion des tâches
 */

export const getCompleted = createSelector([selectTasks], (tasks) =>
	tasks.filter((task) => task.status === "done")
);

export const getImportantTasks = createSelector([selectTasks], (tasks) =>
	tasks.filter((task) => task.isImportant)
);

export const getCompletedImportantTasks = createSelector(
	[selectTasks],
	(tasks) =>
		tasks.filter((task) => task.isImportant && task.status === "done")
);

export const getFilteredTasks = createSelector(
	[selectTasks, getFilter, getStatusFilter],
	(tasks = [], filter, statusFilter) => {
		if (!tasks) return [];
		return tasks.filter((task) => {
			const matchesCompletion =
				filter === "All" ||
				(filter === "Completed" && task.status === "done") ||
				(filter === "Active" && task.status === "pending") ||
				(filter === "Important" && task.isImportant);

			const matchesStatus =
				statusFilter === "All" || task.status === statusFilter;

			return matchesCompletion && matchesStatus;
		});
	}
);

export const {
	changeFilter,
	changeStatusFilter,
	changeSortOrder,
	changeSortType,
	resetFilters,
} = taskSlice.actions;

export default taskSlice.reducer;

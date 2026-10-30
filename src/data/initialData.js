// PlacePrep AI - Comprehensive Historical & Placement Dataset

export const INITIAL_BATCHES = Array.from({ length: 6 }, (_, index) => { const year = String(new Date().getFullYear() + index); return { id: year, label: `Batch ${year}`, year: Number(year) }; });

export const INITIAL_COMPANIES = [];

export const INITIAL_UPCOMING_DRIVES = [];

export const INITIAL_QUESTIONS = [];

export const INITIAL_EXPERIENCES = [];

export const INITIAL_AI_INSIGHTS = {};

import { JournalEntry } from '../../models/index.js';
import { mlClient } from '../../services/mlClient.service.js';
import { CreateJournalInput } from './journal.validation.js';

const memoryJournals: Map<string, any[]> = new Map();

export const journalService = {
  createEntry: async (userId: string, input: CreateJournalInput) => {
    // Run NLP keyword extraction
    const nlpResult = await mlClient.analyzeJournal(userId, input.content);

    let doc: any = null;
    try {
      doc = await JournalEntry.create({
        userId,
        title: input.title || 'Daily Reflection',
        content: input.content,
        isPrivate: input.isPrivate,
        sentiment: nlpResult.sentiment,
        stressSignal: nlpResult.stressSignal,
        emotionSignals: nlpResult.emotionSignals,
      });
    } catch {
      const userList = memoryJournals.get(userId) || [];
      doc = {
        _id: 'journal_' + Date.now(),
        userId,
        title: input.title || 'Daily Reflection',
        content: input.content,
        isPrivate: input.isPrivate,
        sentiment: nlpResult.sentiment,
        stressSignal: nlpResult.stressSignal,
        emotionSignals: nlpResult.emotionSignals,
        createdAt: new Date(),
      };
      userList.unshift(doc);
      memoryJournals.set(userId, userList);
    }

    return doc;
  },

  getUserEntries: async (userId: string) => {
    try {
      const docs = await JournalEntry.find({ userId }).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) return docs;
    } catch {}

    const memList = memoryJournals.get(userId) || [];
    if (memList.length > 0) return memList;

    // Seed synthetic sample journal
    const initial = [
      {
        _id: 'journal_synth_1',
        userId,
        title: 'Preparing for Court Hearing & Witness Support',
        content:
          'Met with the DLSA victim support advocate today. Feeling some anxiety about the upcoming cross-examination on Friday, but practicing 4-7-8 somatic grounding and confirmed safe transport escort.',
        sentiment: 'neutral',
        stressSignal: 0.52,
        emotionSignals: ['hearing_anxiety', 'safety_concern', 'grounding'],
        isPrivate: true,
        createdAt: new Date(Date.now() - 86400000),
      },
    ];
    memoryJournals.set(userId, initial);
    return initial;
  },

  deleteEntry: async (userId: string, id: string) => {
    try {
      await JournalEntry.findOneAndDelete({ _id: id, userId });
    } catch {}

    const list = memoryJournals.get(userId) || [];
    memoryJournals.set(userId, list.filter((j) => j._id !== id));
    return true;
  },

  updateEntry: async (userId: string, id: string, input: Partial<CreateJournalInput>) => {
    let updateData: any = { ...input };
    if (input.content) {
      try {
        const nlpResult = await mlClient.analyzeJournal(userId, input.content);
        updateData.sentiment = nlpResult.sentiment;
        updateData.stressSignal = nlpResult.stressSignal;
        updateData.emotionSignals = nlpResult.emotionSignals;
      } catch {}
    }

    try {
      const doc = await JournalEntry.findOneAndUpdate(
        { _id: id, userId },
        { $set: updateData },
        { new: true }
      ).lean();
      if (doc) return doc;
    } catch {}

    const list = memoryJournals.get(userId) || [];
    const idx = list.findIndex((j) => j._id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData, updatedAt: new Date() };
      memoryJournals.set(userId, list);
      return list[idx];
    }
    return null;
  },
};


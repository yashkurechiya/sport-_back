import Tournament from "../models/tournament.js";

export const isAdminOfTournament = async (userId, tournamentId) => {
  const t = await Tournament.findById(tournamentId);
  return t && t.createdBy.toString() === userId;
};

export const isUserEnrolled = async (userId, tournamentId) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) return false;

  return tournament.participants.some(
    (p) => p.userId.toString() === userId.toString()
  );
};

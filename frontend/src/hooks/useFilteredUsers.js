import { useMemo } from 'react';

export const useFilteredUsers = (allUsers, user, searchQuery, onlineUsers) => {
  // Get set of online user IDs for quick lookup - memoized to prevent infinite loops
  const onlineUserIds = useMemo(
    () => new Set((onlineUsers || []).map(u => u?.userId).filter(Boolean)),
    [onlineUsers]
  );

  // Filter and sort users based on online status and search query
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(allUsers)) {
      return [];
    }

    let filtered = allUsers.filter(u => u?._id !== user?._id); // Exclude current user

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u?.name?.toLowerCase?.().includes(query) ||
        u?.email?.toLowerCase?.().includes(query)
      );
    }

    // Sort: online users first, then by name
    filtered.sort((a, b) => {
      const aOnline = onlineUserIds.has(a?._id) ? 1 : 0;
      const bOnline = onlineUserIds.has(b?._id) ? 1 : 0;
      if (bOnline !== aOnline) return bOnline - aOnline;
      return (a?.name || '').localeCompare(b?.name || '');
    });

    return filtered;
  }, [allUsers, searchQuery, onlineUserIds, user?._id]);

  return { filteredUsers, onlineUserIds };
};
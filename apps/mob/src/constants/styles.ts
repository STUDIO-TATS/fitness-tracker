import { colors } from './colors';

// Typography
export const typography = {
  // Screen titles
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  // Section titles
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    lineHeight: 28,
  },
  // Card titles
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  // Body text
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 22,
  },
  // Small text
  small: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  // Caption text
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Layout
export const layout = {
  screenPadding: spacing.xl,
  sectionSpacing: spacing.xxxl,
  cardSpacing: spacing.lg,
  itemSpacing: spacing.md,
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Common styles
export const commonStyles = {
  // Screen header
  screenHeader: {
    padding: layout.screenPadding,
    paddingBottom: 0,
  },
  screenTitle: {
    ...typography.screenTitle,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  
  // Section
  section: {
    marginBottom: layout.sectionSpacing,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
  },
  
  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  
  // Lists
  listContainer: {
    paddingHorizontal: layout.screenPadding,
  },
  listItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center' as const,
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600' as const,
  },
  
  // Add button
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
};
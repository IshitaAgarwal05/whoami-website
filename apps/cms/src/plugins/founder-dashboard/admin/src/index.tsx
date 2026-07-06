import { pluginId } from './pluginId';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: () => '👑',
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Founder Dashboard',
      },
      Component: async () => {
        const { HomePage } = await import('./pages/HomePage');
        return HomePage;
      },
      permissions: [],
    });

    app.registerPlugin({
      id: pluginId,
      initializer: () => null,
      isReady: true,
      name: 'Founder Dashboard',
    });
  },

  bootstrap() {},
};

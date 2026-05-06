import dashboardItem from './Dashboard';
import brandItem from './Brand';
import productCategoriesItem from './ProductCategories';
import productSkuItem from './ProductSku';
import generateTagItem from './GenerateTag';
import scanActivityItem from './ScanActivity';
import usersRolesItem from './UsersRoles';
import settingsItem from './Settings';

export const DASHBOARD_ITEM = dashboardItem;

export const MASTER_DATA_ITEMS = [
    brandItem,
    productCategoriesItem,
    productSkuItem,
    generateTagItem,
];

export const SYSTEM_ITEMS = [
    scanActivityItem,
    usersRolesItem,
    settingsItem,
];

'use strict'

angular.module('wlmoniter.orders.services', []).factory('orderService', function() {
    return {
        orders: [{
            id: 1,
            customer: 'elesys',
            projectname_c: 'EPS_Main',
            projectname_k: 'Balloon',
            nda: 1,
            contract: 1,
            author: '中山',
            datePublished: '2015-04-04',
            follow: [0, 3],
            follow_email: ['', 'hiroshin@kotei-info.com'],
            notify_email: ['', 'longz@kotei-info.com, quant@kotei-info.com'],
        }, {
            id: 2,
            customer: 'elesys',
            projectname_c: 'EPS_Sub',
            projectname_k: 'Banana',
            nda: 1,
            contract: 0,
            author: '中山',
            datePublished: '2015-05-05',
            follow: [0, 2],
            follow_email: ['', 'hiroshin@kotei-info.com'],
            notify_email: ['', 'longz@kotei-info.com, zanyangh@kotei-info.com'],
        }],
        getAll: function() {
            return this.orders;
        },
        getOrderById: function(id) {
            for (var i in this.orders) {
                if (this.orders[i].id == id) {
                    return this.orders[i];
                }
            }
        },
        updateOrder: function(order) {
            var saveobj = this.getOrderById(order.id)
            for (var key in saveobj) {
                saveobj[key] = order[key];
            }
        },
        getNdaStatus: function() {
            return ['未サイン', 'サイン済み'];
        },
        getContractStatus: function() {
            return ['未サイン', 'サイン済み'];
        },
        getNdaStatusByIdx: function(idx) {
            return this.getNdaStatus()[idx];
        },
        getContractStatusByIdx: function(idx) {
            return this.getContractStatus()[idx];
        },
    };
});

angular.module('wlmoniter.orders.services').factory('Order', function($resource) {
    return $resource('/api/orders/:id');
});


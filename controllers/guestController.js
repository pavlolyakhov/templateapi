const Guest = require('../models/guest');


exports.getGuestId = function (req, res, next) {
        //const newId = ObjectID();
        const newGuest = new Guest();
        newGuest.save(function (err, results) {
            if (err) {
                console.log('guest save error', err);
                debugger;
                return res.status(404).send(err);
            }
            console.log(results._id);
            //res.json({ guestId: results._id });
            res.send({ newGuestID: results._id });
        })
}

exports.saveGuestSelection = function (req, res) {
    debugger;
    const data = req.body;
    const { guestId, selectedItems } = data;
    console.log('recieved selected items', selectedItems);
    const selectedIds = Object.keys(selectedItems);

    Guest.findByIdAndUpdate(guestId, { $set: { 'selectedItems': selectedIds } }, { new: false }, function (err, doc) {
        if (err) {
            console.log('failed update selected items');
            return res.status(404).send(err);
        }
        console.log('selected items updated');
        res.status(200).send(guestId);
    });
}
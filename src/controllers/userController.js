const knexQuery = require('../model/knex')
const jwt = require('jsonwebtoken')
const crypt = require('bcryptjs')
const {user1} = require('../models')


exports.register = async (req, res, next) => {
    try {

    const {firstname, lastname, username, email, password} = req.body
    const hashedPassword = crypt.hashSync(password, 8)
   
    const input = await user1.create({
        firstname: firstname,
        lastname: lastname,
        username: username,
        email: email,
        password: hashedPassword
    })

    // const input = await knexQuery('users').insert({
    //     firstname: body.firstname,
    //     lastname:  body.lastname,
    //     email: body.email,
    //     password: body.password
    // })    

    res.status(201).send({
        message: 'Register success'
    })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: 'an error occured',
            data: 'Check Log'
        })
    }
}

exports.getUser = async(req, res, next) => {
    try{
        const idUser = req.params.id
        const getDataUser = await knexQuery('users').where({
            id: idUser
        }).select('*')

        if (getDataUser>=getDataUser.length){
           return res.status(404).send({
                message: 'Get User Failed',
                data: getDataUser
                //seharusnya menampilkan failed the postman, tapi blum bisa. SUDAH BISA pakai getDataUser.length
            })
        }

        return res.status(200).send({
            message: 'Get User Success',
            data: getDataUser
        })
    }
    catch (error){
        
        res.status(500).send({
            message: 'an error occured',
            data: error
        })
    }
}

exports.user = async (req, res, next) => {
  try {
    const getAllUser = await user1.findAll()

    return res.status(200).send({
        message:'get all user success',
        data: getAllUser
    })
  } catch (error) {
    res.status(500).send({
        message: 'an error occured',
        data: error
    }) 
  }
}

exports.login = async (req, res, next) => {
  
  try{
    const {username, password} = req.body;

    const getData = await user1.findOne({
        where: {username: username}
    })
    

    if(!getData) {
        return res.status(404).send({
            message: 'Login Failed, user not found'
        })
    }

    const isPasswordValid = crypt.compareSync(password, getData.dataValues.password)
    if(!isPasswordValid) {
        return res.status(400).send({
            message: 'Login Failed, Wrong Password'
        })
    }

    const token = jwt.sign({
        id: getData.dataValues.id,
        uname: getData.dataValues.username,
        email: getData.dataValues.email,
    }, process.env.JWT_KEY, {expiresIn: 3600})

  return res.send({
    message: 'sukses Login',
    username: getData.dataValues.username,
    token: token

  })
  }catch (error){
    res.status(500).send({
        message: 'an error occured',
        data: error
    })
  }
}

exports.getMe = async (req, res, next) => {
    try {
        const user = req.user

        const getData = await user1.findOne({
            where: {email: user.email}
        })
        
        if(!getData){
            return res.status(404).send({
                message: 'User Not Found'
            })
        }

        return res.status(200).send({
            message: 'get my profile success',
            data: getData.dataValues
        })

    }catch (error) {
        res.status(500).send({
            message: 'an error occured',
            data: error
        }) 
    }
}
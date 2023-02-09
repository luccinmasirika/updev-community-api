import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostType, RequestStatus } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Get()
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':username')
  async getUserByEmail(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @Get(':id/by/id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Get(':id/views')
  async getUserUserViews(@Param('id') id: string) {
    return this.usersService.getUserViews(id);
  }

  // follow user
  @Patch(':userId/follow/:authorId')
  async followUser(
    @Param('userId') userId: string,
    @Param('authorId') authorId: string,
  ) {
    return this.usersService.followUser(userId, authorId);
  }

  // get user feed
  @Get(':id/feed')
  async getUserFeed(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('type') type: PostType,
  ) {
    return this.usersService.generateFeed(+page, +perPage, id, type);
  }

  // get user followers
  @Get(':id/followers')
  async getUserFollowers(@Param('id') id: string) {
    return this.usersService.getUserFollowers(id);
  }

  @Get(':id/badges')
  async getUserBadges(@Param('id') id: string) {
    return this.usersService.getUserGadges(id);
  }

  // get user following
  @Get(':id/followings')
  async getUserFollowing(@Param('id') id: string) {
    return this.usersService.getUserFollowings(id);
  }

  // get user weekly views
  @Get(':id/weekly-views')
  async getUserWeeklyViews(@Param('id') id: string) {
    return this.usersService.getDailyViewsForWeek(id);
  }

  // get weekly reactions for user
  @Get(':id/weekly-reactions')
  async getWeeklyReactions(@Param('id') id: string) {
    return this.usersService.getDailyReactionsForWeek(id);
  }

  // get user monthly views
  @Get(':id/monthly-views')
  async getDailyViewsForMonth(@Param('id') id: string) {
    return this.usersService.getDailyViewsForMonth(id);
  }

  // get user monthly reactions
  @Get(':id/monthly-reactions')
  async getMonthlyReactionsForMonth(@Param('id') id: string) {
    return this.usersService.getDailyReactionsForMonth(id);
  }

  // get user yearly views
  @Get(':id/yearly-views')
  async getMonthlyViewsForYear(@Param('id') id: string) {
    return this.usersService.getMonthlyViewsForYear(id);
  }

  // get user yearly reactions
  @Get(':id/yearly-reactions')
  async getMonthlyReactionsForYear(@Param('id') id: string) {
    return this.usersService.getMonthlyReactionsForYear(id);
  }

  // get periodically between two dates views
  @Get(':id/views-period')
  async getViewsPeriod(
    @Param('id') id: string,
    @Query('start') start: Date,
    @Query('end') end: Date,
  ) {
    return this.usersService.getPeriodicalViews(id, start, end);
  }

  // get periodically between two dates reactions
  @Get(':id/reactions-period')
  async getReactionsPeriod(
    @Param('id') id: string,
    @Query('start') start: Date,
    @Query('end') end: Date,
  ) {
    return this.usersService.getPeriodicalReactions(id, start, end);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  // update user role (AUTHOR)
  @Patch(':id/role')
  async updateUserRole(@Param('id') id: string) {
    return this.usersService.updateUserRole(id);
  }

  // request author role
  @Patch(':id/request-author')
  async requestAuthorRole(@Param('id') id: string) {
    return this.usersService.requestAuthorRole(id);
  }

  // response to author role request
  @Patch(':id/response-author')
  async responseAuthorRole(
    @Param('id') id: string,
    @Param('status') status: RequestStatus,
  ) {
    return this.usersService.respondToAuthorRequest(id, status);
  }

  @Patch()
  updateUserName() {
    return this.usersService.updateAllUsernames();
  }

  @Patch(':id/disable')
  async disable(@Param('id') id: string) {
    await this.usersService.disableAccount(id);
    return 'Utilisateur désactivé avec succès';
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    await this.usersService.activateUser(id);
    return 'Utilisateur activé avec succès';
  }

  @Patch(':id/delete')
  async delete(@Param('id') id: string) {
    await this.usersService.deleteAccount(id);
    return 'Utilisateur supprimé avec succès';
  }
}
